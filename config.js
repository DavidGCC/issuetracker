const mongoUrl = process.env.NODE_ENV === "test" ? process.env.TEST_DB : process.env.DB;

module.exports = {  mongoUrl };