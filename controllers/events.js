/**
 * GET /
 * Events page.
 */

exports.getEvents = function(req, res) {
  res.render("events/events", {
    title: 'Events'
  });
};
