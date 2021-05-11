const router = require("express").Router();
const Issue = require("../models/Issue");

// GET 
router.get("/:projectTitle", (req, res) => {
    const projectTitle = req.params.projectTitle;
    const queries = req.query;
});


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


// PUT



// DELETE




module.exports = router;