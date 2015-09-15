var React = require('react');
var $ = require('jquery');
var _ = require('underscore');

var Controls = React.createClass({
  render: function() {
    return (
      <div>
        <div className="rate-group">
          <label>Mileage Rate</label>
          <Rate url={this.props.settingsURL} />
        </div>
      </div>
    );
  }
});


var Rate = React.createClass({
  getInitialState: function() {
    return {editing: false};
  },
  loadSettingsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({
          rate: data.rate || 0.575
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());

        var data = xhr.responseJSON;

        alert('Unable to retreive settings.');
      }.bind(this)
    });
  },
  saveRateToServer: function(rate) {
    var self = this;
    $.ajax({
      url: this.props.url,
      method: 'PUT',
      data: {
        rate: rate
      },
      success: function(data) {
        self.setState({editing: false});
      },
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
        alert('Unable to save settings.');
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadSettingsFromServer();
  },
  edit: function() {
    this.setState({editing: true});
  },
  save: function() {
    var rate = parseFloat($(this.refs.rate.getDOMNode()).val());

    if(!rate) {
      return alert('Please enter a valid rate');
    }

    rate = rate.toFixed(3);

    if(rate.slice(-1) === "0") {
      rate = rate.slice(0, -1);
    }

    this.setState({
      rate: rate
    });
    this.saveRateToServer(rate);
  },
  render: function() {
    if(this.state.editing) {
      return (
        <span className="rate-container">
          $<input ref="rate" id="rate" className="form-control rate" defaultValue={this.state.rate} /> per mile
          <div className="btn btn-blue btn-xs" ref="save" onClick={this.save}>Save</div>
        </span>
      );
    } else {
      return (
        <span className="rate-container">
          <input type="hidden" id="rate" value={this.state.rate} />
          ${this.state.rate} per mile
          <div className="btn btn-grey btn-xs" ref="edit" onClick={this.edit}>Edit</div>
        </span>
      );
    }
  }
});


React.render(
  <Controls settingsURL="/api/settings" />,
  document.getElementById('controls')
);
