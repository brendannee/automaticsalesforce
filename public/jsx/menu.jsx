var React = require('react');
var $ = jQuery = require('jquery');

require('bootstrap-sass');

//only allow one popover at a time, close popovers when a user clicks off
$('body').on('click', function(e) {
  $('[data-toggle="popover"]').siblings('.popover').each(function() {
    var $popover = $(this).siblings('[data-toggle="popover"]');

    //don't close popover if clicking on itself
    if($popover.has(e.target).length !== 0 || $('.popover').has(e.target).length !== 0) {
      return;
    }

    $popover.popover('hide');
  });
});

var Menu = React.createClass({
  getInitialState: function() {
    return {first_name: 'User'};
  },
  loadUserFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        if(!data || data.error || !data.first_name) {
          data = {first_name: 'User'};
        }
        this.setState(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadUserFromServer();

    //enable popovers
    $('.user-menu')
      .popover('destroy')
      .popover({
        html: true,
        content: function() { return $('.user-menu .popover-template').html(); },
        placement: 'bottom',
        viewport: '.wrapper'
      });

    $('.top-menu').on('click', '#disconnect', function() {
      return confirm('Are you sure you want to disconnect your Salesforce account? This will delete all settings and expense logs.');
    });
  },
  render: function() {
    return (
      <div className="user-menu" data-toggle="popover">
        <span className="user-name">{this.state.first_name}</span>
        <i className="fa fa-angle-down fa-lg"></i>

        <div className="popover-template">
          <ul>
            <li>
              <a href="https://dashboard.automatic.com">Go to your Dashboard</a>
            </li>
            <li>
              <a href="/logout/">Log out</a>
            </li>
          </ul>
          <ul className="border-top">
            <li>
              <a id="disconnect" href="/disconnect/"><i className="times">&times;</i>Disconnect Salesforce</a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
});

React.render(
  <Menu url="/api/user/" />,
  document.getElementById('top-menu')
);
