'use strict';

let inspect = require('inspect.js');
let sinon = require('sinon');
inspect.useSinon(sinon);

let CoreIO = require('../lib/coreio');

describe('Utils', function() {
	'use strict';

	describe('undotify', function() {
		var data = {
			on: {
				the: {
					end: {
						of: {
							the: {
								world: 'Hello World!'
							}
						}
					}
				},
				getting: {
					thirsty: {
						drinking: function() {
							return 'Coffee';
						}
					}
				}
			}
		};

		it('Should return a value from an object by using a dotnotated string as selector', function() {
			var value = CoreIO.undotify('on.the.end.of.the.world', data);
			inspect(value).isEql('Hello World!');
		});

		it('Should return a value from an object by using a dotnotated string as selector (Returning a function)', function() {
			var value = CoreIO.undotify('on.getting.thirsty', data);
			inspect(value.drinking).isFunction();
			inspect(value.drinking()).isEql('Coffee');
		});

		it('Should return a value from an object by using a dotnotated string as selector (Without path)', function() {
			var value = CoreIO.undotify(null, data);
			inspect(value).isEql(data);
		});
	});

	describe('dedotify', function() {
		it('Should create a new object from a dotified key and a value', function() {
			var data = CoreIO.dedotify('bla.blubb', 'Super blubb');
			inspect(data).isEql({
				bla: {
					blubb: 'Super blubb'
				}
			});
		});

		it('Should extend a existing object from a dotified key and a value', function() {
			var existing = {
				name: 'Andi'
			};
			var data = CoreIO.dedotify(existing, 'needs.something', 'Coffee');

			inspect(data).isEql({
				name: 'Andi',
				needs: {
					something: 'Coffee'
				}
			});
		});
	});

	describe('uid', function() {
		it('Should return a unique string', function() {
			var uid = CoreIO.uid();
			inspect(uid).doesMatch(/^[a-zA-Z0-9]{7}$/);
		});

		it('Should return a unique string with a length of 10 chars', function() {
			var uid = CoreIO.uid();
			inspect(uid).doesMatch(/^[a-zA-Z0-9]{7}$/);
		});

		it('Should return a unique string with a length of 33 chars', function() {
			var uid = CoreIO.uid(33);
			inspect(uid).doesMatch(/^[a-zA-Z0-9]{33}$/);
		});

		it('Should return a unique string with a length of 100 chars', function() {
			var uid = CoreIO.uid(100);
			inspect(uid).doesMatch(/^[a-zA-Z0-9]{100}$/);
		});

		it('Should check 300000 uid\'s', function() {
			var uid = CoreIO.uid();
			for (var i = 0; i < 300000; i++) {
				uid = CoreIO.uid();
				if (!/^[a-zA-Z0-9]{7}$/.test(uid)) {
					this.fail('Unvalid uid! ' + uid);
				}
			}

			inspect(i).isEql(300000);
		});

		it('Should check the uniqueness of 10000 uid\'s', function() {
			this.timeout = 1000000;
			var len = 10000;
			var uid = CoreIO.uid();
			var arr = [];
			for (var i = 0; i < len; i++) {
				uid = CoreIO.uid();
				if (arr.indexOf(uid) === -1) {
					arr.push(uid);
				}
				else {
					this.fail('Not unique');
				}
			}

			inspect(arr).hasLength(len);
		});
	});
});
