'use strict';

let http = require('http');

/**
* CoreIO Socket
*
* Socket module for synced models and lists
*
* @package CoreIO
* @module Socket
* @requires CoreIO.Utils
* @requires CoreIO.Event
*
* @eyample {js}
* let socket = new CoreIO.Socket({
*   channel: 'mychannel'
* });
*
* socket.start().then(() => {
*   socket.on('message', message, data => {
*     console.log('New incoming socket message: ', message, data);
*   });
*
*   // send message to all connected clients
*   socket.emit('foo', {
*     bar: 'bla'
*   });
* })
*
*/
module.exports = function(CoreIO) {
  let log = require('logtopus').getLogger('coreio');
  let sockjs = require('sockjs');

  let Socket = function(conf) {
    conf = conf || {};
    this.port = conf.port || CoreIO.socketPort;
    this.host = conf.host || '0.0.0.0';
    this.path = conf.path || 'xqsocket';
    this.channel = conf.channel;

    if (!this.channel) {
      throw new Error('No channel was set!');
    }
  };

  /**
   * Holds sockJS instances. One per server.
   * @type {Object} __socketServerInstances
   * @private
   */
  Socket.__socketServerInstances = {};

  /**
   * Contains all channels
   * @type {Object} __channels
   * @private
   */
  Socket.__channels = {};


  Socket.prototype.getSocketServer = function() {
    if (!Socket.__socketServerInstances[this.host + ':' + this.port]) {
      let socketServer = sockjs.createServer({
        log: function() {
          // console.log('[SOCKET]', arguments);
        }
      });

      socketServer.connections = [];
      socketServer.channels = {};
      var server;
      server = http.createServer();
      server.listen(this.port, this.host);

      socketServer.installHandlers(server, { prefix: '/' + this.path.replace(/^\//, '') });

      socketServer.on('connection', function(conn) {
        log.sys('New connection', conn.id, conn.pathname);
        Socket.__socketServerInstances[this.host + ':' + this.port].connections.push(conn);

        conn.on('data', function(msg) {
          msg = JSON.parse(msg);
          log.req('Got socket message ' + conn.pathname + ' @ ' + msg.channel + ' : ' + msg.eventName, msg.args);

          var args = msg.args || [];
          args.unshift(msg.eventName);
          args.push(conn);
          socketServer.channels[msg.channel].emit.apply(socketServer.channels[msg.channel], args);
        }.bind(this));

        conn.on('close', function(err) {
          log.sys('Close socket connection', err);

          for (var i = 0, len = Socket.__socketServerInstances[this.host + ':' + this.port].connections.length; i < len; i++) {
            if (Socket.__socketServerInstances[this.host + ':' + this.port].connections[i] === conn) {
              Socket.__socketServerInstances[this.host + ':' + this.port].connections.splice(i, 1);
              break;
            }
          }

          if (this.__monitoring) {
            this.__monitoring.emit('client.disconnect');
          }
        }.bind(this));

        if (this.__monitoring) {
          this.__monitoring.emit('client.connect');
        }
      }.bind(this));

      Socket.__socketServerInstances[this.host + ':' + this.port] = socketServer;
    }

    return Socket.__socketServerInstances[this.host + ':' + this.port];
  }

  Socket.prototype.getChannel = function() {
    if (!Socket.__socketServerInstances[this.host + ':' + this.port].channels[this.channel]) {
      Socket.__socketServerInstances[this.host + ':' + this.port].channels[this.channel] = new CoreIO.Event();
    }

    return Socket.__socketServerInstances[this.host + ':' + this.port].channels[this.channel];
  }

  // CoreIO.extend(Socket.prototype, new CoreIO.Event());

  Socket.prototype.start = function() {
    log.sys('Start SocketServer on port ' + this.port + ' using path ' + this.path);

    return new Promise((resolve, reject) => {
      this.__socket = this.getSocketServer();
      this.__channel = this.getChannel();
      resolve();
    });
  };

  // Socket.prototype.__emit = Socket.prototype.emit;

  Socket.prototype.stop = function() {
    log.sys('Stop SocketServer');
    var numClients = Socket.__socketServerInstances[this.host + ':' + this.port].connections.length;
    Socket.__socketServerInstances[this.host + ':' + this.port].connections.forEach(function(conn) {
      conn.close();
    });

    //Send socket.diconnect event to all channels
    Socket.__channels.forEach(function(channel) {
      channel.emit('socket.disconnect');
    });

    Socket.__socketServerInstances[this.host + ':' + this.port].connections = [];

    log.sys('  ' + numClients + ' disconnected');
  };

  Socket.prototype.emit = function(eventName, data) {
    var time = Date.now(),
      counter = 0;

    var self = this;

    var args = Array.prototype.slice.call(arguments, 1);

    Socket.__socketServerInstances[this.host + ':' + this.port].connections.forEach(function(conn) {
      counter++;

      conn.write(JSON.stringify({
        eventName: eventName,
        channel: self.channel,
        args: args
      }));
    });

    log.res('Send socket message ' + eventName + ' to ' + counter + ' clients in channel ' + this.channel + ' in ' + (Date.now() - time) + 'ms', args);
  };

  Socket.prototype.emitOne = function(conn, eventName, data) {
    var time = Date.now();

    var self = this;

    var args = Array.prototype.slice.call(arguments, 2);

    conn.write(JSON.stringify({
      eventName: eventName,
      channel: self.channel,
      args: args
    }));

    log.res('Send socket message ' + eventName + ' to one client in channel ' + this.channel + ' in ' + (Date.now() - time) + 'ms', args);
  };

  Socket.prototype.emitGroup = function(group, eventName, data) {
    var time = Date.now(),
      counter = 0;

    var self = this;

    var args = Array.prototype.slice.call(arguments, 2);

    Socket.__socketServerInstances[this.host + ':' + this.port].connections.forEach(function(conn) {
      if (conn.groups && conn.groups[group] === true) {
        counter++;

        conn.write(JSON.stringify({
          eventName: eventName,
          channel: self.channel,
          args: args
        }));
      }
    });

    log.res('Send socket group message ' + eventName + ' to ' + counter + ' clients in channel ' + this.channel + ' in ' + (Date.now() - time) + 'ms', args);
  };

  /**
   * Registers a listener for an incoming socket message
   *
   * @method  on
   * @param {String}   eventName Event name
   * @param {Function} callback  Listener callback
   */
  Socket.prototype.on = function(eventName, callback) {
    this.__channel.on(eventName, callback);
  };


  /**
   * Registers a once-listener for an incoming socket message.
   * This listener will be removed if a socet message with the same name has been arrived.
   *
   * @method  once
   * @param  {String}   eventName Event name
   * @param  {Function} callback  Listener callback
   */
  Socket.prototype.once = function(eventName, callback) {
    Socket.__channels[this.channel].once(eventName, callback);
  };

  /**
   * Unregisters a socket listener
   *
   * @method off
   * @param  {String}   eventName Event name
   * @param  {Function} callback  Listener callback (Optional)
   */
  Socket.prototype.off = function(eventName, callback) {
    Socket.__channels[this.channel].off(eventName, callback);
  };

  Socket.prototype.setGroup = function(conn, group) {
    for (var i = 0, len = Socket.__socketServerInstances[this.host + ':' + this.port].connections.length; i < len; i++) {
      if (Socket.__socketServerInstances[this.host + ':' + this.port].connections[i] === conn) {
        if (!Socket.__socketServerInstances[this.host + ':' + this.port].connections[i].groups) {
          Socket.__socketServerInstances[this.host + ':' + this.port].connections[i].groups = {};
        }

        Socket.__socketServerInstances[this.host + ':' + this.port].connections[i].groups[group] = true;
        break;
      }
    }
  };

  Socket.prototype.unsetGroup = function(conn, group) {
    for (var i = 0, len = Socket.__socketServerInstances[this.host + ':' + this.port].connections.length; i < len; i++) {
      if (Socket.__socketServerInstances[this.host + ':' + this.port].connections[i] === conn) {
        if (Socket.__socketServerInstances[this.host + ':' + this.port].connections[i].groups && Socket.__socketServerInstances[this.host + ':' + this.port].connections[i].groups[group]) {
          delete Socket.__socketServerInstances[this.host + ':' + this.port].connections[i].groups[group];
        }

        break;
      }
    }
  };

  Socket.prototype.monitor = function() {
    if (!this.__monitoring) {
      this.__monitoring = new CoreIO.Event();

      this.__monitoring.stats = () => {
        return {
          connections: this.__socket.connections.length,
          channels: Object.keys(this.__socket.channels)
        }
      }
    }

    return this.__monitoring;
  }

  return Socket;
};
