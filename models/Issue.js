const mongoose = require("mongoose");


const issueSchema = new mongoose.Schema({
    projectTitle: { type: String, required: true },
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: { type: String, default: "" },
    open: { type: Boolean, default: true },
    status_text: { type: String, default: "" }
}, { timestamps: { createdAt: "created_on", updatedAt: "updated_on" } });

issueSchema.set("toJSON", {
    transform: (obj, ret) => {
        delete ret.__v;
    }
});


module.exports = new mongoose.model("Issue", issueSchema);