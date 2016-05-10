import {expect} from 'chai';
import sinon from 'sinon';
import spawn from '../src/core/spawn';

describe('spawn()', () => {
  let script = function() {
    /** */
    function timedMessage() {
      self.postMessage("Echo");
    }
    timedMessage();
  };
  it('should spawn a new worker from worker script file giving a path',
     done => {
       let task = spawn('/base/worker_scripts/simple_worker.js');
       let spy = sinon.spy();
       task.subscribe(spy);
       window.setTimeout(() => {
         expect(spy.called).to.equal(true);
         done();
       }, 500);
     });
  it('should spawn a new worker from worker script function',
     done => {
       let task = spawn(script);
       let spy = sinon.spy();
       task.subscribe(spy);
       window.setTimeout(() => {
         expect(spy.called).to.equal(true);
         done();
       }, 500);
     });
  describe('subscribe()', () => {
    it('should subscribe callback function to worker message event',
       done => {
         let task = spawn('/base/worker_scripts/simple_worker.js');
         let spy = sinon.spy();
         task.subscribe(spy);
         window.setTimeout(() => {
           expect(spy.called).to.equal(true);
           done();
         }, 500);
       });
    it('should exec onError callback when worker throw error',
       done => {
         let task = spawn('/base/worker_scripts/error_worker.js');
         let onError = sinon.spy();
         task.subscribe(() => {}, onError);
         window.setTimeout(() => {
           expect(onError.called).to.equal(true);
           done();
         }, 500);
       });
  });
  describe('stop()', () => {
    it('should exec onComplete callback when worker is closed',
       done => {
         let task = spawn('/base/worker_scripts/counter_worker.js');
         let onComplete = sinon.spy();
         task.subscribe(() => {}, () => {}, onComplete);
         task.stop();
         window.setTimeout(() => {
           expect(onComplete.called).to.equal(true);
           done();
         }, 500);
       });
  });
  describe('dispatch()', () => {
    let echoScript = function() {
      self.onmessage = function(data) {
        console.log(data.data);
        self.postMessage(data.data);
      };
    };
    it('should send message data to worker',
       done => {
         let task = spawn(echoScript);
         let onNext = sinon.spy();
         task.subscribe(onNext);
         task.dispatch({
           name: 'name', list: [1, 2, 4], count: 5, meth: function() {}
         });
         window.setTimeout(() => {
           expect(onNext.called).to.equal(true);
           task.stop();
           done();
         }, 500);
       });
  });
});