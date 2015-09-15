var React = require('react');
var classNames = require('classnames');

module.exports = React.createClass({
  createExpense: function() {
    this.props.createExpense(this.props.trip);
  },
  getText: function() {
    if(this.props.trip.pending){
      return (
        <div className="spinner center">
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
        </div>
      );
    } else if(this.props.trip.expensed) {
      return (
        <span><i className="fa fa-check"></i> In Report</span>
      );
    } else {
      return (
        <span>Expense</span>
      );
    }
  },
  render: function() {
    return (
      <button className={classNames(
        'btn',
        'btn-sm',
        'btn-expense',
        {expensed: this.props.trip.expensed}
      )} onClick={this.createExpense} disabled={!!this.props.trip.pending}>{this.getText()}</button>
    );
  }
});
