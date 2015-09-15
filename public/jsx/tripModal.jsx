var React = require('react');
var classNames = require('classnames');
var Button = require('./button.jsx');

module.exports = React.createClass({
  formatMultiline: function(address) {
    if(address && address.multiline) {
      return address.multiline.split('<br>').map(function(line, idx) {
        return (
          <div className="line" key={idx}>{line}</div>
        );
      });
    } else {
      return 'Address not available';
    }
  },
  render: function() {
    return (
      <div className="modal fade">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body single-trip">
              <button className="close" type="button" data-dismiss="modal">
                <span aria-hidden="true">&times;</span>
                <span className=""></span>
              </button>
              <div>
                <div className="trip-header">
                  <div className="start">
                    <div className="time">{this.props.trip.started_at_time}</div>
                    <div className="location">{this.formatMultiline(this.props.trip.start_address)}</div>
                  </div>
                  <div className="end">
                    <div className="time">{this.props.trip.ended_at_time}</div>
                    <div className="location">{this.formatMultiline(this.props.trip.end_address)}</div>
                  </div>
                </div>
                <div className="stats">
                  <div className="stat distance">
                    <div className="value">{this.props.trip.distance}</div>
                    <div className="label">Miles</div>
                  </div>
                  <div className="stat mpg">
                    <div className="value">{this.props.trip.average_mpg}</div>
                    <div className="label">MPG</div>
                  </div>
                  <div className="stat duration">
                    <div className="value">{this.props.trip.duration}</div>
                    <div className="label">{this.props.trip.duration_type}</div>
                  </div>
                </div>
              </div>
              <div className={classNames('map', {'no-map-available': !this.props.trip.path})} id={'map' + this.props.trip.id}>
                <div className="no-map-info">
                  <h2>Route not available</h2>
                  <p>Either a phone was not present, or there was a connection issue during this trip.</p>
                </div>
              </div>
              <div className="map-menu">
                <div className="zoom-control">
                  <div className="zoom-in">+</div>
                  <div className="zoom-out">—</div>
                </div>
                <div className="map-menu-right">
                  <Button trip={this.props.trip} createExpense={this.props.createExpense} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
