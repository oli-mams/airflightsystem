sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
],
	function (Controller, JSONModel, MessageBox) {
		"use strict";

		return Controller.extend("fiori.bootcamp.airflightsystem.controller.AirFlightCreate", {
			onInit: function () {
				var oView = this.getView();
				var oBookingModel = new JSONModel({});
				oView.setModel(oBookingModel, "Booking");
				var oCrewModel = new JSONModel([]);
				oView.setModel(oCrewModel, "CrewModel");
			},
			/*handle date change - formatting*/
			onHandleDateChange: function (oEvent) {

			},
			/*Airline valuehelp*/
			onRequestAirline: function (oEvent) {
				this.oInput = oEvent.getSource();
				var oModel = this.getView().getModel();
				this.getView().setBusy(true);
				oModel.read("/AirlineSet", {
					success: jQuery.proxy(this.getAirlineList, this),
					error: jQuery.proxy(this.getAirlineListFailure, this)
				});

			},
			getAirlineList: function (oData, response) {
				this.getView().setBusy(false);
				var AirlineValueHelp = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
					title: "Airline Value Help",
					supportMultiselect: false,
					supportRanges: false,
					supportRangesOnly: false,
					key: "AirlineId",
					descriptionKey: "AirlineName",
					ok: jQuery.proxy(function (oControlEvent) {
						this.oInput.setValue(oControlEvent.getParameter("tokens")[0].getKey());

						AirlineValueHelp.close();
					}, this),
					cancel: function (oControlEvent) {
						AirlineValueHelp.close();
					},
					afterClose: function () {
						AirlineValueHelp.destroy();
					}
				});

				AirlineValueHelp.setKey("AirlineId");

				AirlineValueHelp.setRangeKeyFields([{
					label: "Airline Id",
					key: "AirlineId"
				}, {
					label: "Airline Name",
					key: "AirlineName"
				}]);

				var airlineF4ColModel = new sap.ui.model.json.JSONModel();
				airlineF4ColModel.setData({
					cols: [{
						label: "Airline Id",
						template: "AirlineId"
					}, {
						label: "Airline Name",
						template: "AirlineName"

					}, {
						label: "Operating Country",
						template: "OperatingCountry"

					}]
				});

				AirlineValueHelp.setModel(airlineF4ColModel, "columns");
				var airlineF4RowsModel = new sap.ui.model.json.JSONModel();
				airlineF4RowsModel.setData(oData.results);
				AirlineValueHelp.setModel(airlineF4RowsModel);

				if (AirlineValueHelp.getTable().bindRows) {
					AirlineValueHelp.getTable().bindRows("/");
				}

				if (AirlineValueHelp.getTable().bindItems) {
					var oTable = AirlineValueHelp.getTable();

					oTable.bindAggregation("items", "/", function (sId, oContext) {
						var aCols = oTable.getModel("columns").getData().cols;

						return new sap.m.ColumnListItem({
							cells: aCols.map(function (column) {
								let colname = column.template;
								return new sap.m.Label({
									text: "{" + colname + "}"
								});
							})
						});
					});
				}

				AirlineValueHelp.open();

				//Filter bar creation
				let oFilterBar = new sap.ui.comp.filterbar.FilterBar({
					//  id: "F4SupplierDialog",
					advancedMode: true,
					filterBarExpanded: false,
					filterGroupItems: [
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airline",
							name: "AirlineId",
							label: "Airline Id",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airline",
							name: "AirlineName",
							label: "Airline Name",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airline",
							name: "OperatingCountry",
							label: "Operating Country",
							control: new sap.m.Input()
						})
					],
					search: function (oEvent) {
						let aSelectionSet = oEvent.getParameters().selectionSet;
						let oBinding;
						if (AirlineValueHelp.theTable.getBinding("rows")) {
							oBinding = AirlineValueHelp.theTable.getBinding("rows");
						} else if (AirlineValueHelp.theTable.getBinding("items")) {
							oBinding = AirlineValueHelp.theTable.getBinding("items");
						}
						let aFilterItems = [];
						let bAllFieldsEmpty = true;
						let oFilter = {};
						let aFilter = [];
						if (aSelectionSet[0].getValue() !== "") {
							let oFilterCode = new sap.ui.model.Filter("AirlineId", sap.ui.model.FilterOperator.Contains, aSelectionSet[0].getValue());
							aFilterItems.push(oFilterCode);
							bAllFieldsEmpty = false;
						}
						if (aSelectionSet[1].getValue() !== "") {
							let oFilterName = new sap.ui.model.Filter("AirlineName", sap.ui.model.FilterOperator.Contains, aSelectionSet[1].getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (sap.ui.getCore().byId("AirlineBasicSearch").getValue() !== "") {
							let oFilterCode = new sap.ui.model.Filter("AirlineId", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"AirlineBasicSearch").getValue());
							aFilterItems.push(oFilterCode);
							let oFilterName = new sap.ui.model.Filter("AirlineName", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"AirlineBasicSearch").getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (!bAllFieldsEmpty) {
							oFilter = new sap.ui.model.Filter(aFilterItems, false);
							aFilter.push(oFilter);
						}
						oBinding.filter(aFilter);
					}
				});

				//Check when the below condition is satisfied
				if (oFilterBar.setBasicSearch) {
					oFilterBar.setBasicSearch(new sap.m.SearchField({
						showSearchButton: sap.ui.Device.system.phone,
						placeholder: "{i18n>SRCH}",
						id: "AirlineBasicSearch",
						search: function (event) {
							let airlineBasicSearchText = event.getSource().getValue();
							if (airlineBasicSearchText !== "") {
								let aFilterItems = [];
								let oFilter = {};
								let aFilter = [];
								let oBinding;
								if (AirlineValueHelp.theTable.getBinding("rows")) {
									oBinding = AirlineValueHelp.theTable.getBinding("rows");
								} else if (AirlineValueHelp.theTable.getBinding("items")) {
									oBinding = AirlineValueHelp.theTable.getBinding("items");
								}
								let oFilterCode = new sap.ui.model.Filter("AirlineId", sap.ui.model.FilterOperator.Contains,
									airlineBasicSearchText);
								aFilterItems.push(oFilterCode);
								let oFilterName = new sap.ui.model.Filter("AirlineName", sap.ui.model.FilterOperator.Contains,
									airlineBasicSearchText);
								aFilterItems.push(oFilterName);
								oFilter = new sap.ui.model.Filter(aFilterItems, false);
								aFilter.push(oFilter);
								oBinding.filter(aFilter);
							}
						}
					}));
				}
				AirlineValueHelp.setFilterBar(oFilterBar);
			},
			getAirlineListFailure: function (oError) {
				this.getView().setBusy(false);
				let oMessage = oError.message;
				MessageBox.error(oMessage, {
					title: "Error"
				});
			},
			/*Flight valuehelp*/
			onRequestFlight: function (oEvent) {
				this.oInput = oEvent.getSource();
				var oModel = this.getView().getModel();
				this.getView().setBusy(true);
				oModel.read("/FlightSet", {
					success: jQuery.proxy(this.getFlightList, this),
					error: jQuery.proxy(this.getFlightListFailure, this)
				});

			},
			getFlightList: function (oData, response) {
				this.getView().setBusy(false);
				var FlightValueHelp = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
					title: "Flight Value Help",
					supportMultiselect: false,
					supportRanges: false,
					supportRangesOnly: false,
					key: "FlightId",
					descriptionKey: "FlightNo",
					ok: jQuery.proxy(function (oControlEvent) {
						this.oInput.setValue(oControlEvent.getParameter("tokens")[0].getKey());

						FlightValueHelp.close();
					}, this),
					cancel: function (oControlEvent) {
						FlightValueHelp.close();
					},
					afterClose: function () {
						FlightValueHelp.destroy();
					}
				});

				FlightValueHelp.setKey("FlightId");

				FlightValueHelp.setRangeKeyFields([{
					label: "Flight Id",
					key: "FlightId"
				}, {
					label: "Flight No",
					key: "FlightNo"
				}]);

				var flightF4ColModel = new sap.ui.model.json.JSONModel();
				flightF4ColModel.setData({
					cols: [{
						label: "Flight Id",
						template: "FlightId"
					}, {
						label: "Flight No",
						template: "FlightNo"

					}, {
						label: "Airline Id",
						template: "AirlineId"

					}, {
						label: "OriginAirportCode",
						template: "Origin Airport Code"

					}]
				});

				FlightValueHelp.setModel(flightF4ColModel, "columns");
				var flightF4RowsModel = new sap.ui.model.json.JSONModel();
				flightF4RowsModel.setData(oData.results);
				FlightValueHelp.setModel(flightF4RowsModel);

				if (FlightValueHelp.getTable().bindRows) {
					FlightValueHelp.getTable().bindRows("/");
				}

				if (FlightValueHelp.getTable().bindItems) {
					var oTable = FlightValueHelp.getTable();

					oTable.bindAggregation("items", "/", function (sId, oContext) {
						var aCols = oTable.getModel("columns").getData().cols;

						return new sap.m.ColumnListItem({
							cells: aCols.map(function (column) {
								let colname = column.template;
								return new sap.m.Label({
									text: "{" + colname + "}"
								});
							})
						});
					});
				}

				FlightValueHelp.open();

				//Filter bar creation
				let oFilterBar = new sap.ui.comp.filterbar.FilterBar({
					//  id: "F4SupplierDialog",
					advancedMode: true,
					filterBarExpanded: false,
					filterGroupItems: [
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Flight",
							name: "FlightId",
							label: "Flight Id",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Flight",
							name: "FlightNo",
							label: "Flight No",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Flight",
							name: "AirlineId",
							label: "Airline Id",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Flight",
							name: "OriginAirportCode",
							label: "Origin Airport Code",
							control: new sap.m.Input()
						})
					],
					search: function (oEvent) {
						let aSelectionSet = oEvent.getParameters().selectionSet;
						let oBinding;
						if (FlightValueHelp.theTable.getBinding("rows")) {
							oBinding = FlightValueHelp.theTable.getBinding("rows");
						} else if (FlightValueHelp.theTable.getBinding("items")) {
							oBinding = FlightValueHelp.theTable.getBinding("items");
						}
						let aFilterItems = [];
						let bAllFieldsEmpty = true;
						let oFilter = {};
						let aFilter = [];
						if (aSelectionSet[0].getValue() !== "") {
							let oFilterCode = new sap.ui.model.Filter("FlightId", sap.ui.model.FilterOperator.Contains, aSelectionSet[0].getValue());
							aFilterItems.push(oFilterCode);
							bAllFieldsEmpty = false;
						}
						if (aSelectionSet[1].getValue() !== "") {
							let oFilterName = new sap.ui.model.Filter("FlightNo", sap.ui.model.FilterOperator.Contains, aSelectionSet[1].getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (sap.ui.getCore().byId("FlightBasicSearch").getValue() !== "") {
							let oFilterCode = new sap.ui.model.Filter("FlightId", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"FlightBasicSearch").getValue());
							aFilterItems.push(oFilterCode);
							let oFilterName = new sap.ui.model.Filter("FlightNo", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"FlightBasicSearch").getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (!bAllFieldsEmpty) {
							oFilter = new sap.ui.model.Filter(aFilterItems, false);
							aFilter.push(oFilter);
						}
						oBinding.filter(aFilter);
					}
				});

				//Check when the below condition is satisfied
				if (oFilterBar.setBasicSearch) {
					oFilterBar.setBasicSearch(new sap.m.SearchField({
						showSearchButton: sap.ui.Device.system.phone,
						placeholder: "{i18n>SRCH}",
						id: "FlightBasicSearch",
						search: function (event) {
							let flightBasicSearchText = event.getSource().getValue();
							if (flightBasicSearchText !== "") {
								let aFilterItems = [];
								let oFilter = {};
								let aFilter = [];
								let oBinding;
								if (FlightValueHelp.theTable.getBinding("rows")) {
									oBinding = FlightValueHelp.theTable.getBinding("rows");
								} else if (FlightValueHelp.theTable.getBinding("items")) {
									oBinding = FlightValueHelp.theTable.getBinding("items");
								}
								let oFilterCode = new sap.ui.model.Filter("FlightId", sap.ui.model.FilterOperator.Contains,
									flightBasicSearchText);
								aFilterItems.push(oFilterCode);
								let oFilterName = new sap.ui.model.Filter("FlightNo", sap.ui.model.FilterOperator.Contains,
									flightBasicSearchText);
								aFilterItems.push(oFilterName);
								oFilter = new sap.ui.model.Filter(aFilterItems, false);
								aFilter.push(oFilter);
								oBinding.filter(aFilter);
							}
						}
					}));
				}
				FlightValueHelp.setFilterBar(oFilterBar);
			},
			getFlightListFailure: function (oError) {
				this.getView().setBusy(false);
				let oMessage = oError.message;
				MessageBox.error(oMessage, {
					title: "Error"
				});
			},

			/*Airport code valuehelp*/
			onRequestAirportCode: function (oEvent) {
				this.oInput = oEvent.getSource();
				var oModel = this.getView().getModel();
				this.getView().setBusy(true);
				oModel.read("/AirportSet", {
					success: jQuery.proxy(this.getAirportList, this),
					error: jQuery.proxy(this.getAirportListFailure, this)
				});

			},
			getAirportList: function (oData, response) {
				this.getView().setBusy(false);
				var AirportValueHelp = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
					title: "Airport Value Help",
					supportMultiselect: false,
					supportRanges: false,
					supportRangesOnly: false,
					key: "AirportCode",
					descriptionKey: "AirportName",
					ok: jQuery.proxy(function (oControlEvent) {
						this.oInput.setValue(oControlEvent.getParameter("tokens")[0].getKey());

						AirportValueHelp.close();
					}, this),
					cancel: function (oControlEvent) {
						AirportValueHelp.close();
					},
					afterClose: function () {
						AirportValueHelp.destroy();
					}
				});

				AirportValueHelp.setKey("AirportCode");

				AirportValueHelp.setRangeKeyFields([{
					label: "Airport Code",
					key: "AirportCode"
				}, {
					label: "Airport Name",
					key: "AirportName"
				}]);

				var airportF4ColModel = new sap.ui.model.json.JSONModel();
				airportF4ColModel.setData({
					cols: [{
						label: "Airport Code",
						template: "AirportCode"
					}, {
						label: "Airport Name",
						template: "AirportName"

					}, {
						label: "Country",
						template: "Country"

					}, {
						label: "City",
						template: "City"

					}]
				});

				AirportValueHelp.setModel(airportF4ColModel, "columns");
				var airportF4RowsModel = new sap.ui.model.json.JSONModel();
				airportF4RowsModel.setData(oData.results);
				AirportValueHelp.setModel(airportF4RowsModel);

				if (AirportValueHelp.getTable().bindRows) {
					AirportValueHelp.getTable().bindRows("/");
				}

				if (AirportValueHelp.getTable().bindItems) {
					var oTable = AirportValueHelp.getTable();

					oTable.bindAggregation("items", "/", function (sId, oContext) {
						var aCols = oTable.getModel("columns").getData().cols;

						return new sap.m.ColumnListItem({
							cells: aCols.map(function (column) {
								let colname = column.template;
								return new sap.m.Label({
									text: "{" + colname + "}"
								});
							})
						});
					});
				}

				AirportValueHelp.open();

				//Filter bar creation
				let oFilterBar = new sap.ui.comp.filterbar.FilterBar({
					//  id: "F4SupplierDialog",
					advancedMode: true,
					filterBarExpanded: false,
					filterGroupItems: [
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airport",
							name: "AirportCode",
							label: "Airport Code",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airport",
							name: "AirportName",
							label: "Airport Name",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airport",
							name: "Country",
							label: "Country",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airport",
							name: "City",
							label: "City",
							control: new sap.m.Input()
						})
					],
					search: function (oEvent) {
						let aSelectionSet = oEvent.getParameters().selectionSet;
						let oBinding;
						if (AirportValueHelp.theTable.getBinding("rows")) {
							oBinding = AirportValueHelp.theTable.getBinding("rows");
						} else if (AirportValueHelp.theTable.getBinding("items")) {
							oBinding = AirportValueHelp.theTable.getBinding("items");
						}
						let aFilterItems = [];
						let bAllFieldsEmpty = true;
						let oFilter = {};
						let aFilter = [];
						if (aSelectionSet[0].getValue() !== "") {
							let oFilterCode = new sap.ui.model.Filter("AirportCode", sap.ui.model.FilterOperator.Contains, aSelectionSet[0].getValue());
							aFilterItems.push(oFilterCode);
							bAllFieldsEmpty = false;
						}
						if (aSelectionSet[1].getValue() !== "") {
							let oFilterName = new sap.ui.model.Filter("AirportName", sap.ui.model.FilterOperator.Contains, aSelectionSet[1].getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (sap.ui.getCore().byId("AirportBasicSearch").getValue() !== "") {
							let oFilterCode = new sap.ui.model.Filter("AirportCode", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"AirportBasicSearch").getValue());
							aFilterItems.push(oFilterCode);
							let oFilterName = new sap.ui.model.Filter("AirportName", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"AirportBasicSearch").getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (!bAllFieldsEmpty) {
							oFilter = new sap.ui.model.Filter(aFilterItems, false);
							aFilter.push(oFilter);
						}
						oBinding.filter(aFilter);
					}
				});

				//Check when the below condition is satisfied
				if (oFilterBar.setBasicSearch) {
					oFilterBar.setBasicSearch(new sap.m.SearchField({
						showSearchButton: sap.ui.Device.system.phone,
						placeholder: "{i18n>SRCH}",
						id: "AirportBasicSearch",
						search: function (event) {
							let flightBasicSearchText = event.getSource().getValue();
							if (flightBasicSearchText !== "") {
								let aFilterItems = [];
								let oFilter = {};
								let aFilter = [];
								let oBinding;
								if (AirportValueHelp.theTable.getBinding("rows")) {
									oBinding = AirportValueHelp.theTable.getBinding("rows");
								} else if (AirportValueHelp.theTable.getBinding("items")) {
									oBinding = AirportValueHelp.theTable.getBinding("items");
								}
								let oFilterCode = new sap.ui.model.Filter("AirportCode", sap.ui.model.FilterOperator.Contains,
									flightBasicSearchText);
								aFilterItems.push(oFilterCode);
								let oFilterName = new sap.ui.model.Filter("AirportName", sap.ui.model.FilterOperator.Contains,
									flightBasicSearchText);
								aFilterItems.push(oFilterName);
								oFilter = new sap.ui.model.Filter(aFilterItems, false);
								aFilter.push(oFilter);
								oBinding.filter(aFilter);
							}
						}
					}));
				}
				AirportValueHelp.setFilterBar(oFilterBar);
			},
			getAirportListFailure: function (oError) {
				this.getView().setBusy(false);
				let oMessage = oError.message;
				MessageBox.error(oMessage, {
					title: "Error"
				});
			},

			onRequestCrew: function (oEvent) {
				this.oInput = oEvent.getSource();
				var oModel = this.getView().getModel();
				this.getView().setBusy(true);
				oModel.read("/CrewSet", {
					success: jQuery.proxy(this.getCrewList, this),
					error: jQuery.proxy(this.getCrewListFailure, this)
				});

			},
			getCrewList: function (oData, response) {
				this.getView().setBusy(false);
				var CrewValueHelp = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
					title: "Crew Value Help",
					supportMultiselect: false,
					supportRanges: false,
					supportRangesOnly: false,
					key: "CrewId",
					descriptionKey: "Role",
					ok: jQuery.proxy(function (oControlEvent) {
						this.oInput.setValue(oControlEvent.getParameter("tokens")[0].getKey());
						CrewValueHelp.close();
					}, this),
					cancel: function (oControlEvent) {
						CrewValueHelp.close();
					},
					afterClose: function () {
						CrewValueHelp.destroy();
					}
				});

				CrewValueHelp.setKey("CrewId");

				CrewValueHelp.setRangeKeyFields([{
					label: "Crew Id",
					key: "CrewtId"
				}, {
					label: "Role",
					key: "Role"
				}]);

				var crewF4ColModel = new sap.ui.model.json.JSONModel();
				crewF4ColModel.setData({
					cols: [{
						label: "Crew Id",
						template: "CrewId"
					}, {
						label: "Role",
						template: "Role"

					}, {
						label: "Last Name",
						template: "LastName"

					}, {
						label: "First Name",
						template: "FirstName"

					}]
				});

				CrewValueHelp.setModel(crewF4ColModel, "columns");
				var crewF4RowsModel = new sap.ui.model.json.JSONModel();
				crewF4RowsModel.setData(oData.results);
				CrewValueHelp.setModel(crewF4RowsModel);

				if (CrewValueHelp.getTable().bindRows) {
					CrewValueHelp.getTable().bindRows("/");
				}

				if (CrewValueHelp.getTable().bindItems) {
					var oTable = CrewValueHelp.getTable();

					oTable.bindAggregation("items", "/", function (sId, oContext) {
						var aCols = oTable.getModel("columns").getData().cols;

						return new sap.m.ColumnListItem({
							cells: aCols.map(function (column) {
								let colname = column.template;
								return new sap.m.Label({
									text: "{" + colname + "}"
								});
							})
						});
					});
				}

				CrewValueHelp.open();

				//Filter bar creation
				let oFilterBar = new sap.ui.comp.filterbar.FilterBar({
					//  id: "F4SupplierDialog",
					advancedMode: true,
					filterBarExpanded: false,
					filterGroupItems: [
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Crew",
							name: "CrewId",
							label: "Crew Id",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Crew",
							name: "Role",
							label: "Role",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Crew",
							name: "LastName",
							label: "Last Name",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Crew",
							name: "FirstName",
							label: "First Name",
							control: new sap.m.Input()
						})
					],
					search: function (oEvent) {
						let aSelectionSet = oEvent.getParameters().selectionSet;
						let oBinding;
						if (CrewValueHelp.theTable.getBinding("rows")) {
							oBinding = CrewValueHelp.theTable.getBinding("rows");
						} else if (CrewValueHelp.theTable.getBinding("items")) {
							oBinding = CrewValueHelp.theTable.getBinding("items");
						}
						let aFilterItems = [];
						let bAllFieldsEmpty = true;
						let oFilter = {};
						let aFilter = [];
						if (aSelectionSet[0].getValue() !== "") {
							let oFilterCode = new sap.ui.model.Filter("CrewId", sap.ui.model.FilterOperator.Contains, aSelectionSet[0].getValue());
							aFilterItems.push(oFilterCode);
							bAllFieldsEmpty = false;
						}
						if (aSelectionSet[1].getValue() !== "") {
							let oFilterName = new sap.ui.model.Filter("Role", sap.ui.model.FilterOperator.Contains, aSelectionSet[1].getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (sap.ui.getCore().byId("CrewBasicSearch").getValue() !== "") {
							let oFilterCode = new sap.ui.model.Filter("CrewId", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"CrewBasicSearch").getValue());
							aFilterItems.push(oFilterCode);
							let oFilterName = new sap.ui.model.Filter("Role", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"CrewBasicSearch").getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (!bAllFieldsEmpty) {
							oFilter = new sap.ui.model.Filter(aFilterItems, false);
							aFilter.push(oFilter);
						}
						oBinding.filter(aFilter);
					}
				});

				//Check when the below condition is satisfied
				if (oFilterBar.setBasicSearch) {
					oFilterBar.setBasicSearch(new sap.m.SearchField({
						showSearchButton: sap.ui.Device.system.phone,
						placeholder: "{i18n>SRCH}",
						id: "CrewBasicSearch",
						search: function (event) {
							let flightBasicSearchText = event.getSource().getValue();
							if (flightBasicSearchText !== "") {
								let aFilterItems = [];
								let oFilter = {};
								let aFilter = [];
								let oBinding;
								if (CrewValueHelp.theTable.getBinding("rows")) {
									oBinding = CrewValueHelp.theTable.getBinding("rows");
								} else if (CrewValueHelp.theTable.getBinding("items")) {
									oBinding = CrewValueHelp.theTable.getBinding("items");
								}
								let oFilterCode = new sap.ui.model.Filter("CrewId", sap.ui.model.FilterOperator.Contains,
									flightBasicSearchText);
								aFilterItems.push(oFilterCode);
								let oFilterName = new sap.ui.model.Filter("Role", sap.ui.model.FilterOperator.Contains,
									flightBasicSearchText);
								aFilterItems.push(oFilterName);
								oFilter = new sap.ui.model.Filter(aFilterItems, false);
								aFilter.push(oFilter);
								oBinding.filter(aFilter);
							}
						}
					}));
				}
				CrewValueHelp.setFilterBar(oFilterBar);
			},
			getCrewListFailure: function (oError) {
				this.getView().setBusy(false);
				let oMessage = oError.message;
				MessageBox.error(oMessage, {
					title: "Error"
				});
			},
			/*Save Booking*/
			onPressSaveBooking: function (oEvent) {
				var that = this;
				this.getView().setBusy(true);
				var aMandFields = this.getMandatoryFields();
				var bPassedValidation = this.onValidateInput(aMandFields);

				if (bPassedValidation === false) {
					this.getView().setBusy(false);
					MessageBox.warning("All fields are mandatory.");

					return false;
				} else {
					var oModel = this.getView().getModel();
					var oBookingModel = this.getView().getModel("Booking");
					var oBookingObj = oBookingModel.getData();

					oModel.create("/", oBookingObj, {
						method: "POST",
						success: function (oData, response) {
							that.getView().setBusy(false);
							MessageBox.success(response.success.message.value);
						}.bind(that),
						error: function (oError) {
							that.getView().setBusy(false);
							MessageBox.error(oError.error.message.value);
						}.bind(that)
					});
				}
			},
			/*Cancel Booking - clear booking screen*/
			onPressCancelBooking: function (oEvent) {
				debugger;
				var oBookingModel = this.getView().getModel("Booking");
				var oCrewModel = this.getView().getModel("CrewModel");
				oBookingModel.setData({});
				oBookingModel.refresh();

				oCrewModel.setData([]);
				oCrewModel.refresh();

			},
			onAddCrew: function (oEvent) {
				var oCrewModel = this.getView().getModel("CrewModel");
				var aCrewData = oCrewModel.getData();
				var oCrewObj = {
					"CrewId": "",
					"LastName": "",
					"FirstName": "",
					"Role": ""
				};
				aCrewData.push(oCrewObj);
				oCrewModel.setData(aCrewData);
				oCrewModel.refresh();
			},
			onDeleteCrew: function (oEvent) {
				var oCrewModel = this.getView().getModel("CrewModel");
				var aCrewData = oCrewModel.getData();
				var oTable = this.getView().byId("idCrewTable");

				var oSelectedIndex = parseInt(oTable.getSelectedContexts()[0].getPath().split("/")[1]);
				aCrewData.splice(oSelectedIndex, 1);
				oCrewModel.setData(aCrewData);
				oCrewModel.refresh();

			},
			getMandatoryFields: function () {
				var aMandatoryFields;
				return aMandatoryFields = ['idDepartureFrom', 'idDepartureTo', 'idBookingDate', 'idAirlineId', 'idAirlinename', 'idFlightId',
					'idFlightNumber', 'idAirportCode', 'idAirportName', 'idFlighteDateTime'];

			},

			onValidateInput: function (aMandatoryFields) {
				var that = this;
				var bValid = true;
				aMandatoryFields.forEach(function (sInput) {
					var oField = that.getView().byId(sInput);
					if (oField.getValue() == "" || oField.getValue() == undefined) {
						bValid = false;
						oField.setValueState("Error");
					} else {
						oField.setValueState("None");
					}
				});
				return bValid;
			},
			onLiveChange: function (oEvent) {
				debugger;
				var sValue = oEvent.getParameter("value");
				if (sValue === "") {
					oEvent.getSource().setValueState("Error");
				} else {
					oEvent.getSource().setValueState("None");
				}
			}
		});
	});