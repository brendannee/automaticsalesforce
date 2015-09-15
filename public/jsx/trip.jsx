var React = require('react');
var classNames = require('classnames');
var Button = require('./button.jsx');
var $ = require('jquery');

module.exports = React.createClass({
  showModal: function(e) {
    if(!$(e.target).parents('.btn-expense').length && !$(e.target).hasClass('btn-expense')) {
      this.props.showModal(this.props.trip);
    }
  },
  render: function() {
    return (
      <div className="trip" data-trip-id={this.props.trip.id} onClick={this.showModal}>
        <div className="ball"></div>
        <div className="start">
          <div className="start-time">{this.props.trip.started_at_time}</div>
          <div className="start-address">
            {this.props.trip.start_address.street || 'Address not available'}<br />
            <strong>{this.props.trip.start_address.cityState}</strong>
          </div>
          <div className="start-street">{this.props.trip.start_address.streetCity || 'Address not available'}</div>
        </div>
        <div className="trip-line">
          <div className="top-ball">A</div>
          <div className="bottom-ball">B</div>
        </div>
        <div className="end">
          <div className="end-time">{this.props.trip.ended_at_time}</div>
          <div className="end-address">
            {this.props.trip.end_address.street || 'Address not available'}<br />
            <strong>{this.props.trip.end_address.cityState}</strong>
          </div>
          <div className="end-street">{this.props.trip.end_address.streetCity || 'Address not available'}</div>
        </div>
        <div className="stats">
          <div className="stat distance">{this.props.trip.distance}</div>
          <div className="stat mpg">{this.props.trip.average_mpg}</div>
          <div className={classNames('stat', 'duration', this.props.trip.duration_type)}>{this.props.trip.duration}</div>
        </div>
        <Button trip={this.props.trip} createExpense={this.props.createExpense} />
      </div>
    );
  }
});
