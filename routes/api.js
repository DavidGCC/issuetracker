const router = require("express").Router();
const Issue = require("../models/Issue");



// POST
router.post("/:projectTitle", async (req, res) => {
    const projectTitle = req.params.projectTitle;
    const { issue_title, issue_text, created_by } = req.body;
    if (!issue_title || !issue_text || !created_by) {
        res.json({
            error: "required field(s) missing"
        });
        return;
    }
    try {
        const newIssue = new Issue({
            projectTitle,
            ...req.body
        });
        const response = await newIssue.save();
        const { projectTitle: title, ...rest } = response.toJSON();
        res.json(rest);
    } catch (error) {
        console.log("Error while creating", error);
    }
});

// GET 
router.get("/:projectTitle", async (req, res) => {
    const projectTitle = req.params.projectTitle;
    const queries = req.query;
    try {
        const response = await Issue.find({ projectTitle, ...queries });
        const result = response.reduce((final, issue) => {
            const { projectTitle: title, ...rest } = issue.toJSON();
            final = [ ...final, rest ];
            return final;
        }, []);
        res.json(result);
    } catch (error) {
        console.log("Error while retrieving issues", error);
    }
});

// PUT
router.put("/:projectTitle", async (req, res) => {
    const { _id, ...rest } = req.body;
    if (!_id) {
        res.json({ error: "missing _id" });
        return;
    }
    const fields = ["issue_title", "issue_text", "created_by", "assigned_to", "open", "status_text"];
    let containsFields = 0;
    fields.forEach(field => {
        if (rest[field] !== undefined) {
            containsFields = 1;
            return;
        }
    });
    if (containsFields === 0) {
        res.json({ error: "no update field(s) sent", _id });
        return;
    }
    try {
        for (let prop in rest) if (rest[prop] === "") delete rest[prop];
        const resp = await Issue.findByIdAndUpdate(_id, rest);
        if (resp === null) throw new Error();
        res.json({ result: "successfully updated", _id });
    } catch (error) {
        console.log("error when updating issue", error);
        res.json({ error: "could not update", _id });
    }
});



// DELETE
router.delete("/:projectTitle", async (req, res) => {
    const { _id } = req.body;
    if (!_id) {
        res.json({ error: "missing _id" });
        return;
    }
    try {
        const resp = await Issue.findByIdAndDelete(_id);
        if (resp === null) throw new Error();
        res.json({
            result: "successfully deleted",
            _id
        })
    } catch (error) {
        console.log("error while deleting issue", error);
        res.json({ error: "could not delete", _id });
    }
});




module.exports = router;