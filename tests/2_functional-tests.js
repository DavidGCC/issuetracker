const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Issue = require("../models/Issue");

chai.use(chaiHttp);


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

    let id1, id2, id3;

    this.beforeEach(async () => {
        await Issue.deleteMany({});
        const testIssue = new Issue({
            projectTitle: "testProject",
            ...everyField
        });
        const testIssue1 = new Issue({
            projectTitle: "testProject",
            ...everyField,
            status_text: "test status 2"
        });
        const testIssue2 = new Issue({
            projectTitle: "testProject",
            ...everyField,
            status_text: "test status",
            issue_text: "test issue text 2"
        });
        const r1 = await testIssue.save();
        const r2 = await testIssue1.save();
        const r3 = await testIssue2.save();
        id1 = r1._id;
        id2 = r2._id;
        id3 = r3._id;
    })

    suite("API POST request tests", () => {

        test("Create an issue with every field: POST request to /api/issues/{project}", async () => {
            const res = await chai.request(server)
                .post("/api/issues/testProjcet")
                .set("Content-Type", "application/json")
                .send(everyField);

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
        });

        test("Create an issue with only required fields: POST request to /api/issues/{project}", async () => {
            const res = await chai.request(server)
                .post("/api/issues/testProjcet")
                .set("Content-Type", "application/json")
                .send(requiredOnly);

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
        });

        test("Create an issue with missing required fields: POST request to /api/issues/{project}", async () => {
            const { issue_title, ...rest } = everyField;
            const res = await chai.request(server)
                .post("/api/issues/testProject")
                .set("Content-Type", "application/json")
                .send(rest);

            assert.equal(res.status, 200);
            assert.deepEqual(JSON.parse(res.text), { error: "required field(s) missing" });
        });

    });

    suite("API GET request tests", () => {

        test("View issues on a project: GET request to /api/issues/{project}", async () => {
            const res = await chai.request(server)
                .get("/api/issues/testProject");

            assert.equal(res.status, 200);
            assert.isArray(JSON.parse(res.text));
            ["_id", "issue_text", "issue_title", "created_by", "created_on", "updated_on", "open", "status_text", "assigned_to"]
                .forEach(item => {
                    assert.isDefined(JSON.parse(res.text)[0], item);
                });
        });

        test("View issues on a project with one filter: GET request to /api/issues/{project}", async () => {
            const res = await chai.request(server)
                .get("/api/issues/testProject?status_text=test%20status%202");

            assert.equal(res.status, 200);
            const toArr = JSON.parse(res.text);
            assert.lengthOf(toArr, 1);
            assert.equal(toArr[0].status_text, "test status 2");
        });

        test("View issues on a project with multiple filters: GET request to /api/issues/{project}", async () => {
            const res = await chai.request(server)
                .get("/api/issues/testProject?status_text=test%20status&issue_text=test%20issue%20text%202");

            assert.equal(res.status, 200);
            const toArr = JSON.parse(res.text);
            assert.lengthOf(toArr, 1);
            assert.equal(toArr[0].status_text, "test status");
            assert.equal(toArr[0].issue_text, "test issue text 2");
        });

    });

    suite("API PUT request tests", () => {

        test("Update one field on an issue: PUT request to /api/issues/{project}", async () => {
            const beforeUpdate = await Issue.findById(id1);
            const res = await chai.request(server)
                .put("/api/issues/testProject")
                .set("Content-Type", "application/json")
                .send({ ...everyField, issue_title: "test title updated", _id: id1 });

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { result: "successfully updated", _id: id1.toString() });
            const afterUpdate = await Issue.findById(id1);
            assert.notEqual(beforeUpdate.toJSON().updated_on, afterUpdate.toJSON().updated_on);
            assert.equal(afterUpdate.toJSON().issue_title, "test title updated");
        });

        test("Update multiple fields on an issue: PUT request to /api/issues/{project}", async () => {
            const beforeUpdate = await Issue.findById(id1);
            const res = await chai.request(server)
                .put("/api/issues/testProject")
                .set("Content-Type", "application/json")
                .send({ ...everyField, issue_title: "test title updated", _id: id1, open: false });

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { result: "successfully updated", _id: id1.toString() });
            const afterUpdate = await Issue.findById(id1);
            assert.notEqual(beforeUpdate.toJSON().updated_on, afterUpdate.toJSON().updated_on);
            assert.equal(afterUpdate.toJSON().issue_title, "test title updated");
            assert.equal(afterUpdate.toJSON().open, false);
        });

        test("Update an issue with missing _id: PUT request to /api/issues/{project}", async () => {
            const res = await chai.request(server)
                .put("/api/issues/testProject")
                .set("Content-Type", "application/json")
                .send({ ...everyField, issue_title: "test title updated" });
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: "missing _id" });
        });

        test("Update an issue with no fields to update: PUT request to /api/issues/{project}", async () => {
            const beforeUpdate = await Issue.findById(id1);
            const res = await chai.request(server)
                .put("/api/issues/testProject")
                .set("Content-Type", "application/json")
                .send({ _id: id1 });
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: "no update field(s) sent", _id: id1.toString() });
            const afterUpdate = await Issue.findById(id1);
            assert.deepEqual(beforeUpdate.toJSON(), afterUpdate.toJSON());
        });

        test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", async () => {
            const res = await chai.request(server)
                .put("/api/issues/testProject")
                .set("Content-Type", "application/json")
                .send({ _id: "1", ...everyField });
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: "could not update", _id: "1" });
        });

    });

    suite("API DELETE request tests", () => {

        test("Delete an issue: DELETE request to /api/issues/{project}", async () => {
            const res = await chai.request(server)
                .delete("/api/issues/testProject")
                .set("Content-Type", "application/json")
                .send({ _id: id1.toString() });
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { result: "successfully deleted", _id: id1.toString() });
            const afterDelete = await Issue.findById(id1);
            assert.isNull(afterDelete);
        });

        test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", async () => {
            const res = await chai.request(server)
                .delete("/api/issues/testProject")
                .set("Content-Type", "application/json")
                .send({ _id: "1" });
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: "could not delete", _id: "1" });
        });

        test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", async () => {
            const res = await chai.request(server)
                .delete("/api/issues/testProject")
                .set("Content-Type", "application/json")
                .send({})
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: "missing _id" });
        });
    })
});
