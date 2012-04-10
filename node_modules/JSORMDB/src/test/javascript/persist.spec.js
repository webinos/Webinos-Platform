describe('ContextStorage', function() {
    var database = require('../../main/javascript/persist');
    var database_object;
    
    beforeEach(function() {
        database_object = new database.JSONDatabase({path: './data/test.json',transactional: false});
    });
    
    it('Query field >= value', function() {
        var query = {field: "age", compare: "ge", value: 20};
        var results = database_object.query({where: query, fields: {name: true}});
        expect(results[1].name).toEqual("Test3");
    });
    
    it('Conjunction-join query field1 == value1 OR field2 <= value2', function() {
        var query = {join: "or", terms: [{field: "name", compare: "equals", value: 'Test'},{field: "age", compare: "le", value: 25}]};
        var results = database_object.query({where: query});
        expect(results[0].name).toEqual("Test");
    });
});

