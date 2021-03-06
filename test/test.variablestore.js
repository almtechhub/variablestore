"use strict"

import chai from "chai";
import VariableStore from "../variablestore";

function isEmpty(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) return false;
    }
    return true;
}

describe("VariableStore", function() {
   describe("Construction", function() {
      it('Returned object should be VariableStore on empty parameters', function() {
         let varStore = new VariableStore();
         chai.expect(varStore.constructor.name === "VariableStore");
      });
      it('Returned object should be VariableStore on (Regex)', function() {
         let varStore = new VariableStore(/s/);
         chai.expect(varStore.constructor.name === "VariableStore");
      });
      it('Returned object should be VariableStore on (Regex, [])', function() {
         let varStore = new VariableStore(/s/, []);
         chai.expect(varStore.constructor.name === "VariableStore");
      });
      it('Error thrown when VariableStore passed object to first parameter', function() {
         const vals = [{}, 1, "", [], null];
         vals.map(e => chai.expect(() => new VariableStore(e)).to.throw(Error))
      });
      it('Error thrown when VariableStore given (Regex, {})', function() {
         const vals = [{}, "", 0, null];
         chai.expect(() => new VariableStore(/s/, {})).to.throw(Error);
      });
   });
   describe("No Variables in Store", function() {
      it('variableNames should return empty array on empty VariableStore', function() {
         let varStore = new VariableStore();
         chai.expect(varStore.variableNames.length).to.equal(0);
      });
      it('variables should return empty array on empty VariableStore', function() {
         let varStore = new VariableStore();
         chai.expect(isEmpty(varStore.variables)).to.be.true;
      });
      it('clear should leave object with no variables', function() {
         let varStore = new VariableStore();
         varStore.set({name: "test", value: 1});
         chai.expect(varStore.variableNames.length).to.equal(1);
         varStore.clear();
         chai.expect(varStore.variableNames.length).to.equal(0);
         chai.expect(isEmpty(varStore.variables)).to.be.true;
      });
   });
   describe("Adding Variables to Store", function() {
      it('set on empty object should throw error', function() {
         let varStore = new VariableStore();
         chai.expect(() => varStore.set({})).to.throw(Error);
      });
      it('set on object with name but no value should throw error', function() {
         let varStore = new VariableStore();
         chai.expect(() => varStore.set({name:"a"})).to.throw(Error);
      });
      it('set on object with name and value should return undefined', function() {
         let varStore = new VariableStore();
         chai.expect(varStore.set({name:"a", value:"b"})).to.equal(undefined);
      });
      it('default regex should throw error on variables that begin with numbers', function() {
         let varStore = new VariableStore();
         chai.expect(() => varStore.set({name:"1s", value:"b"})).to.throw(Error);
      });
      it('default regex should throw error on variables that begin with symbols', function() {
         let varStore = new VariableStore();
         chai.expect(() => varStore.set({name:"$s", value:"b"})).to.throw(Error);
      });
      it('set should not be able to set using restricted names', function() {
         let varStore = new VariableStore(/s/g,["ans","bob"]);
         chai.expect(() => varStore.set({name:"ans", value:"b"})).to.throw(Error);
         chai.expect(() => varStore.set({name:"bob", value:"b"})).to.throw(Error);
      });
      it('setRestricted should be able to set using restricted names', function() {
         let varStore = new VariableStore(/\S+/g,["ans"]);
         chai.expect(() => varStore.set({name:"ans", value:"b"})).to.throw(Error);
         chai.expect(varStore.setRestricted({name:"ans", value:"b"})).to.equal(undefined);
      });
      it('set should not be able to change constant variables', function() {
         let varStore = new VariableStore();
         varStore.set({name:"a", value:"b", const: true});
         chai.expect(() => varStore.set({name:"a", value:"b"})).to.throw(Error);
      });
      it('set should be able to overwrite non-constant values', function() {
         let varStore = new VariableStore();
         varStore.set({name:"a", value:"b"});
         chai.expect(varStore.get("a")).to.equal("b");
         varStore.set({name:"a", value:"c"});
         chai.expect(varStore.get("a")).to.equal("c");
      });
   });
   describe("Interacting with loaded store", function() {
      it('has should return true for variables in store.', function() {
         let varStore = new VariableStore();
         varStore.set({name:"a", value:"b"});
         chai.expect(varStore.has("a")).to.be.true;
      });
      it('variable store should have both elements entered into variable store', function() {
         let varStore = new VariableStore();
         varStore.set({name:"a", value:"b"});
         varStore.set({name:"c", value:"d"});
         chai.expect(varStore.has("a")).to.be.true;
         chai.expect(varStore.has("c")).to.be.true;
      });
      it('clear should empty out the variable store', function() {
         let varStore = new VariableStore();
         varStore.set({name:"a", value:"b"});
         varStore.set({name:"c", value:"d"});
         chai.expect(varStore.has("a")).to.be.true;
         chai.expect(varStore.has("c")).to.be.true;
         chai.expect(varStore.variableNames.length).to.equal(2);
         chai.expect(!isEmpty(varStore));
         varStore.clear();
         chai.expect(varStore.has("a")).to.be.false;
         chai.expect(varStore.has("c")).to.be.false;
         chai.expect(varStore.variableNames.length).to.equal(0);
         chai.expect(isEmpty(varStore));
      });
      it('clearNonConst should empty other than const', function() {
         let varStore = new VariableStore();
         varStore.set({name:"a", value:"b"});
         varStore.set({name:"c", value:"d"});
         varStore.set({name:"e", value:"f", const: true});
         chai.expect(varStore.has("a")).to.be.true;
         chai.expect(varStore.has("c")).to.be.true;
         chai.expect(varStore.variableNames.length).to.equal(3);
         chai.expect(!isEmpty(varStore));
         varStore.clearNonConst();
         chai.expect(varStore.has("a")).to.be.false;
         chai.expect(varStore.has("c")).to.be.false;
         chai.expect(varStore.variableNames.length).to.equal(1);
         chai.expect(varStore.has("e"));
      });
      it('get should return the same value that was entered', function() {
         let varStore = new VariableStore();
         varStore.set({name:"a", value:"b"});
         varStore.set({name:"c", value:"d"});
         chai.expect(varStore.get("a")).to.equal("b");
         chai.expect(varStore.get("c")).to.equal("d");
      });
      it('delete should remove an element from variablestore', function() {
         let varStore = new VariableStore();
         varStore.set({name:"a", value:"b"});
         chai.expect(varStore.has("a")).to.be.true;
         varStore.del("a");
         chai.expect(varStore.has("a")).to.be.false;
      });
      it('delete passed an array should delete multiple variables at once.', function() {
         let varStore = new VariableStore();
         varStore.set({name:"a", value:"b"});
         varStore.set({name:"c", value:"d"});
         chai.expect(varStore.has("a")).to.be.true;
         chai.expect(varStore.has("c")).to.be.true;
         varStore.del(["a","c"]);
         chai.expect(varStore.has("a")).to.be.false;
         chai.expect(varStore.has("c")).to.be.false;
      });
      it('variableNames should return all variable names entered', function() {
         let varStore = new VariableStore();
         varStore.set({name:"a", value:"b"});
         varStore.set({name:"c", value:"d"});
         let varNames = varStore.variableNames;
         chai.expect(varNames.indexOf("a") != -1 && varNames.indexOf("c") != -1).to.be.true;
      });
      it('variables should return all variable objects entered', function() {
         let varStore = new VariableStore();
         varStore.set({name:"a", value:"b"});
         varStore.set({name:"c", value:"d"});
         let variables = varStore.variables;
         chai.expect(variables["a"].value === "b").to.be.true;
         chai.expect(variables["c"].value === "d").to.be.true;
      });
       it('variables shouldbe able to set using an array', function () {
        let varStore = new VariableStore();
        varStore.set([{ name: "a", value: "b" }, { name: "c", value: "d" }]);
        let variables = varStore.variables;
        chai.expect(variables["a"].value === "b").to.be.true;
        chai.expect(variables["c"].value === "d").to.be.true;
       });
   });
});
