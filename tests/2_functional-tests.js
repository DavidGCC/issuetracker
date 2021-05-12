const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Issue = require("../models/Issue");

chai.use(chaiHttp);

const { mongoUrl } = require("../config");

const everyField = {
    issue_title: "test issue",
    issue_text: "test issue text",
    created_by: "test user",
    assigned_to: "test asignee",
    status_text: "test status"
};

const requiredOnly = {
    issue_title: "test issue",
    issue_text: "test issue text",
    created_by: "test user",
};

suite('Functional Tests', function () {

    this.beforeEach(async () => {
        await Issue.deleteMany({});
        const testIssue = new Issue({
            projectTitle: "testProject",
            ...everyField
        });
        await testIssue.save();
    })

    suite("API POST request tests", () => {

        test("Create an issue with every field: POST request to /api/issues/{project}", (done) => {

            chai.request(server)
                .post("/api/issues/testProjcet")
                .set("Content-Type", "application/json")
                .send(everyField)
                .end((err, res) => {
                    assert.isNull(err);
                    assert.equal(res.status, 200);
                    assert.equal(res.type, "application/json");
                    assert.isDefined(res.text);
                    const toJson = JSON.parse(res.text);

                    // Check returned object values
                    Object.keys(toJson).forEach(key => {
                        if (!everyField[key]) return;
                        assert.equal(toJson[key], everyField[key]);
                    });

                    assert.isDefined(toJson.created_on);
                    assert.isDefined(toJson.updated_on);
                    assert.notEqual(toJson.assigned_to, "");
                    assert.notEqual(toJson.status_text, "");
                    done();
                });
        });

        test("Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
            chai.request(server)
                .post("/api/issues/testProjcet")
                .set("Content-Type", "application/json")
                .send(requiredOnly)
                .end((err, res) => {
                    assert.isNull(err);
                    assert.equal(res.status, 200);
                    assert.equal(res.type, "application/json");
                    assert.isDefined(res.text);
                    const toJson = JSON.parse(res.text);

                    //check returned object values
                    Object.keys(toJson).forEach(key => {
                        if (!requiredOnly[key]) return;
                        assert.equal(toJson[key], requiredOnly[key]);
                    });

                    assert.isDefined(toJson.created_on);
                    assert.isDefined(toJson.updated_on);
                    assert.equal(toJson.assigned_to, "");
                    assert.equal(toJson.status_text, "");
                    done();
                }); 
        });

        test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
            const { issue_title, ...rest } = everyField;
            chai.request(server)
                .post("/api/issues/testProject")
                .set("Content-Type", "application/json")
                .send(rest)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.deepEqual(JSON.parse(res.text), { error: "required field(s) missing" });
                    done();
                });
        });

    });

    suite("API GET request tests", () => {

        test("View issues on a project: GET request to /api/issues/{project}", () => {

        });

        test("View issues on a project with one filter: GET request to /api/issues/{project}", () => {

        });

        test("View issues on a project with multiple filters: GET request to /api/issues/{project}", () => {

        });

    });

    suite("API PUT request tests", () => {

        test("Update one field on an issue: PUT request to /api/issues/{project}", () => {

        });

        test("Update multiple fields on an issue: PUT request to /api/issues/{project}", () => {

        });

        test("Update an issue with missing _id: PUT request to /api/issues/{project}", () => {

        });

        test("Update an issue with no fields to update: PUT request to /api/issues/{project}", () => {

        });

        test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", () => {

        });

    });
});
