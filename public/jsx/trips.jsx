var React = require('react');
var classNames = require('classnames');
var $ = require('jquery');
var _ = require('underscore');
var moment = require('moment-timezone');
var helper = require('../javascripts/helper');
var map = require('../javascripts/map');
var Button = require('./button.jsx');
var Filters = require('./filters.jsx');
var Trip = require('./trip.jsx');
var TripModal = require('./tripModal.jsx');

require('bootstrap-sass');

var Trips = React.createClass({
  getInitialState: function() {
    return {
      trips: [],
      expenses: [],
      filters: {},
      page: 1,
      selectedTrip: {},
      loading: false
    };
  },
  componentDidMount: function() {
    this.loadTripsFromServer();
    this.loadExpensesFromServer();

    window.addEventListener('scroll', this.loadTripsFromServer);
  },
  componentDidUpdate: function() {
    // load more trips on re-render as there may not be enough to fill screen
    this.loadTripsFromServer();
  },
  loadTripsFromServer: function() {
    if(this.shouldLoad()) {
      this.setState({loading: true});
      $.ajax({
        url: this.props.url + '?page=' + this.state.page,
        dataType: 'json',
        success: function(data) {
          var trips = this.state.trips.concat(data.map(helper.formatTrip));
          var page = (data.length) ? this.state.page + 1 : undefined;

          this.setState({
            page: page,
            trips: trips,
            loading: false
          });
          this.connectTripsAndExpenses();
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
          this.setState({loading: false});
        }.bind(this)
      });
    }
  },
  loadExpensesFromServer: function() {
    $.ajax({
      url: this.props.expenseURL,
      dataType: 'json',
      success: function(data) {
        this.setState({expenses: data});
        this.connectTripsAndExpenses();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  connectTripsAndExpenses: function() {
    var tripsObj = _.reduce(this.state.trips, function(memo, trip) {
      memo[trip.id] = trip;
      return memo;
    }, {});

    this.state.expenses.forEach(function(tripId) {
      if(tripsObj.hasOwnProperty(tripId)) {
        tripsObj[tripId].expensed = true;
      }
    });

    this.setState({trips: this.state.trips});
  },
  createExpense: function(trip) {
    var self = this;

    if(trip.expensed && !window.confirm('You have expensed this already. Are you sure you want to do it again?')) {
      return false;
    }

    var rate = $('#rate').val();

    trip.pending = true;
    trip.expensed = true;
    this.setState({trips: this.state.trips});

    // delay marking expensed
    setTimeout(function() {
      trip.pending = false;
      self.setState({trips: self.state.trips});
    }, 500);

    $.post('/api/expenses/', {
      trip: JSON.stringify(trip),
      tripID: trip.id,
      amount: helper.m_to_mi(trip.distance_m) * parseFloat(rate),
      mileage: helper.m_to_mi(trip.distance_m),
      date: moment(trip.started_at).tz(trip.start_timezone).toISOString(),
      name: helper.getTripName(trip, rate),
      startLocation: trip.start_address.cleaned,
      endLocation: trip.end_address.cleaned
    })
    .done(function(expense) {
      trip.expensed = true;
      self.setState({trips: self.state.trips});
    })
    .fail(function(jqXHR) {
      console.error(jqXHR.responseText || jqXHR);
      alert('Error creating Salesforce expense. Try again later.');
      trip.pending = false;
      trip.expensed = false;
      self.setState({trips: self.state.trips});
    });
  },
  showModal: function(trip) {

    this.setState({selectedTrip: trip});

    map.destroyMap();

    $(this.refs.modal.getDOMNode())
      .modal({show: true})
      .off('shown.bs.modal')
      .on('shown.bs.modal', function() {
        if(trip.path) {
          map.drawMap(trip);
        }
      });
  },
  shouldLoad: function() {
    return this.state.loading !== true && this.state.page && $(window).scrollTop() + $(window).height() >= $('body').height() - 70;
  },
  getLoading: function() {
    if(this.state.loading !== false) {
      return (
        <div className={classNames('loading', {bottom: this.state.trips.length})}>Loading Trips...</div>
      );
    }
  },
  getTrips: function() {
    var self = this;
    if(this.state.trips.length || this.state.loading !== false) {
      var tripDate;
      var dateHeader;

      return this.filterTrips().map(function(trip, idx) {
        if(trip.started_at_date !== tripDate) {
          tripDate = trip.started_at_date;

          dateHeader = (
            <div className="trip-date">{trip.dayOfWeek}, {trip.started_at_date}</div>
          );
        } else {
          dateHeader = '';
        }

        return (
          <div key={idx}>
            {dateHeader}
            <Trip trip={trip} createExpense={self.createExpense} showModal={self.showModal} />
          </div>
        );
      });
    } else {
      return (
        <div className="no-trips">No Automatic Trips</div>
      );
    }
  },
  filterTrips: function() {
    var filters = this.state.filters;
    return this.state.trips.reduce(function(memo, trip) {
      var include = true;

      if(filters.weekday_only) {
        if(trip.dayOfWeek === 'Saturday' || trip.dayOfWeek === 'Sunday') {
          include = false;
        }
      }

      if(filters.business_only) {
        if(!_.contains(trip.tags, 'business')) {
          include = false;
        }
      }

      if(filters.unexpensed_only) {
        if(trip.expensed) {
          include = false;
        }
      }

      if(include) {
        memo.push(trip);
      }
      return memo;
    }, []);
  },
  applyFilters: function(filters) {
    this.setState({filters: filters});
  },
  render: function() {
    return (
      <div>
        <Filters applyFilters={this.applyFilters} />
        <div className="table-header">
          <div className="column-header start-header">Start</div>
          <div className="column-header end-header">End</div>
          <div className="column-header distance-header">Distance</div>
          <div className="column-header mpg-header">MPG</div>
          <div className="column-header duration-header">Duration</div>
        </div>
        <div className="table-body">
          <div className="trips-container">
            {this.getTrips()}
            {this.getLoading()}
          </div>
        </div>
        <TripModal trip={this.state.selectedTrip} createExpense={this.createExpense} ref="modal" />
      </div>
    );
  }
});


React.render(
  <Trips url="/api/trips" expenseURL="/api/expenses" />,
  document.getElementById('trips')
);
