var React = require('react');

module.exports = Filters = React.createClass({
  applyFilters: function() {
    var filters = {
      business_only: this.refs.business_only.getDOMNode().checked,
      weekday_only: this.refs.weekday_only.getDOMNode().checked,
      unexpensed_only: this.refs.unexpensed_only.getDOMNode().checked,
    };
    this.props.applyFilters(filters);
  },
  render: function() {
    return (
      <div id="filters" className="filters">
        <label>Filters</label>
        <label className="filter"><input type="checkbox" ref="business_only" onChange={this.applyFilters} /> Tagged Business</label>
        <label className="filter"><input type="checkbox" ref="weekday_only" onChange={this.applyFilters} /> Weekday Only</label>
        <label className="filter"><input type="checkbox" ref="unexpensed_only" onChange={this.applyFilters} /> Unexpensed Only</label>
      </div>
    );
  }
});
