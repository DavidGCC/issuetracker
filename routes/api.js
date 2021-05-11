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



// DELETE




module.exports = router;