Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    //Default funciton launched by app
    launch: function() {
        console.log('Test log to console: ', Date().toLocaleString());
        
        // Radian
		//var project_oid = '/project/37192747640';

		this.add({
			xtype: 'rallycombobox',
			stateful: true,
			stateId: this.getContext().getScopedStateId('initiative'),
			width: 600,
			fieldLabel: 'Select Initiative:',
			// Display Template
			displayTpl: Ext.create('Ext.XTemplate','<tpl for=".">','{FormattedID} - {Name}','</tpl>'),
			// List Template
			tpl: Ext.create('Ext.XTemplate','<tpl for=".">','<div class="x-boundlist-item">{FormattedID} - {Name}</div>','</tpl>'),
			storeConfig: {
				autoLoad: true,
				model: 'PortfolioItem/Initiative',
				fetch: ['FormattedID', 'Name'],
				sorters: [
					{
						property: 'ObjectID',
						direction: 'ASC'
					}
				],
				remoteGroup: false,
				remoteSort: false,
				remoteFilter: false,
				limit: Infinity
				/*
				context: {
					project: project_oid,
					projectScopeDown: true,
					projectScopeUp: false
				}
				*/
			},
			// stateful: false,
			listeners: {
				select: this._onSelect,
				ready: this._onLoad,
				scope: this
			}
		});
        
    },
    
    
	_onLoad: function() {
		//var project_oid = '/project/37192747640';
		
		this.add({
			xtype: 'rallycardboard',
			types: ['User Story'],
			attribute: 'ScheduleState',
			// context: this.getContext(),
			storeConfig: {
				fetch: ['Feature'],
				/*
				context: {
					project: project_oid,
					projectScopeDown: true,
					projectScopeUp: false
				},
				*/
				filters: [
					this._getFilter()
				]
			},
			columnConfig: {
				plugins: [
					{ptype: 'rallycolumncardcounter'}
				]
			},
			cardConfig: {
				fields: ['Feature','Iteration','Project'],
				showIconsAndHighlightBorder: false,
				editable: false,
				showAge: true
			}
			// rowConfig: {
				// field: 'Release'
			// }
		});
	},
	
	_onSelect: function() {
		var board = this.down('rallycardboard');
		board.refresh({
			storeConfig: {
				filters: [this._getFilter()]
			}
		});
	},
		
	_getFilter: function() {
		var combo = this.down('rallycombobox');
		var filters = Ext.create('Rally.data.QueryFilter', {
			property: 'Feature.Parent.Parent',
			operator: '=',
			value: combo.getValue()
		});
		filters = filters.and({
			property: 'DirectChildrenCount',
			operator: '=',
			value: '0'
		});
		/*
		filters = filters.and({
			property: 'Iteration',
			operator: '=',
			value: null
		});
		*/
		// filters = filters.and({
			// property: 'AcceptedDate',
			// operator: '<',
			// value: 'LastMonth'
		// });
		filters = filters.and({
			property: 'ScheduleState',
			operator: '=',
			value: 'Refining'
		});
		// filters.toString();
		return filters;
	}
    
    
    
});











/* Version 5


Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    //Default funciton launched by app
    launch: function() {
        console.log('Test log to console');
        
        this.pulldownContainer = Ext.create('Ext.container.Container', {
            id: 'pulldown-container-id',
            layout: {
                type: 'hbox',
                align: 'stretch'
            }
        });
        
        
        this.add(this.pulldownContainer);
        
        
        this._loadIterations();
        
        //  this._loadData();
    },
    
    
    //Load Iterations
    _loadIterations: function() {
        //creating at app level (like global variable)
        this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
            fieldLabel: 'Iteration',
            labelAlign: 'right',
            width: 300,
            //listeners is a config of IterationComboBox, listeners contains events
            listeners: {
                //ready is an event of IterationComboBox
                ready: function(combobox) {
                    //this._loadData();
                    this._loadSeverities();
                },
                //on combobox selection change
                select: function (combobox, records) {
                    this._loadData();
                },
                scope: this
            }
        });
        
        this.pulldownContainer.add(this.iterComboBox);
    },
    
    
    //Load Severities
    _loadSeverities: function() {
        this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
            model: 'Defect',
            field: 'Severity',
            fieldLabel: 'Severity',
            labelAlign: 'right',
            width: 300,
            listeners: {
                ready: function(combobox) {
                    this._loadData();
                },
                select: function (combobox, records) {
                    this._loadData();
                },
                scope: this
            }
        });
        
        this.pulldownContainer.add(this.severityComboBox);
    },
    
    
    //Load data from Rally
    _loadData: function() {
        //gets selected item from drop down
        var selectedIterRef = this.iterComboBox.getRecord().get('_ref');
        console.log('Selected Iteration:', selectedIterRef);
        
        var selectedSevValue = this.severityComboBox.getRecord().get('value');
        console.log('Selected Severity:', selectedSevValue);
       
        
        var myFilters = [
            {
               property: 'Iteration',
               operation: '=',
               value: selectedIterRef
            },
            {
                property: 'Severity',
                operation: '=',
                value: selectedSevValue
            }
        ];
        
        
        
        
        // If store exists, just load new data
        if (this.defectStore) {
            this.defectStore.setFilter(myFilters);
            this.defectStore.load();
            
        } else {
            // create store
            this.defectStore = Ext.create('Rally.data.wsapi.Store', {
                model: 'Defect',
                autoLoad: true,
                filters: myFilters,
                listeners: {
                    load: function(myStore, myData, success) {
                        //console.log('got data', myStore, myData, success);
                        console.log('got data');
                    
                        if (!this.myGrid) {
                            this._createGrid(myStore);
                        }
                        
                    },
                    scope: this
                },
                fetch: ['Name', 'ScheduleState', 'FormattedID', 'Severity', 'Iteration']
            });
        }
    },
    
    
    //Load and display Grid
    _createGrid: function(myStoryStore) {
        this.myGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStoryStore,
            columnCfgs: [
                'FormattedID',
                'Name',
                'Severity',
                'Iteration'
                ]
        });
        
        //console.log('my grid', myGrid);
        console.log('my grid');
        
        //console.log('what is this?', this);
        console.log('what is this?');
        
        this.add(this.myGrid);
    }
});


*/




/* Version 4

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    //Default funciton launched by app
    launch: function() {
        console.log('Test log to console');
        
        this.pulldownContainer = Ext.create('Ext.container.Container', {
            id: 'pulldown-container-id',
            layout: {
                type: 'hbox',
                align: 'stretch'
            }
        });
        
        
        this.add(this.pulldownContainer);
        
        
        this._loadIterations();
        
        //  this._loadData();
    },
    
    
    //Load Iterations
    _loadIterations: function() {
        //creating at app level (like global variable)
        this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
            fieldLabel: 'Iteration',
            labelAlign: 'right',
            width: 300,
            //listeners is a config of IterationComboBox, listeners contains events
            listeners: {
                //ready is an event of IterationComboBox
                ready: function(combobox) {
                    //this._loadData();
                    this._loadSeverities();
                },
                //on combobox selection change
                select: function (combobox, records) {
                    this._loadData();
                },
                scope: this
            }
        });
        
        this.pulldownContainer.add(this.iterComboBox);
    },
    
    
    //Load Severities
    _loadSeverities: function() {
        this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
            model: 'Defect',
            field: 'Severity',
            fieldLabel: 'Severity',
            labelAlign: 'right',
            width: 300,
            listeners: {
                ready: function(combobox) {
                    this._loadData();
                },
                select: function (combobox, records) {
                    this._loadData();
                },
                scope: this
            }
        });
        
        this.pulldownContainer.add(this.severityComboBox);
    },
    
    
    //Load data from Rally
    _loadData: function() {
        //gets selected item from drop down
        var selectedIterRef = this.iterComboBox.getRecord().get('_ref');
        console.log('Selected Iteration:', selectedIterRef);
        
        var selectedSevValue = this.severityComboBox.getRecord().get('value');
        console.log('Selected Severity:', selectedSevValue);
       
        
        var myFilters = [
            {
               property: 'Iteration',
               operation: '=',
               value: selectedIterRef
            },
            {
                property: 'Severity',
                operation: '=',
                value: selectedSevValue
            }
        ];
        
        
        
        
        // If store exists, just load new data
        if (this.defectStore) {
            this.defectStore.setFilter(myFilters);
            this.defectStore.load();
            
        } else {
            // create store
            this.defectStore = Ext.create('Rally.data.wsapi.Store', {
                model: 'Defect',
                autoLoad: true,
                filters: myFilters,
                listeners: {
                    load: function(myStore, myData, success) {
                        //console.log('got data', myStore, myData, success);
                        console.log('got data');
                    
                        if (!this.myGrid) {
                            this._createGrid(myStore);
                        }
                        
                    },
                    scope: this
                },
                fetch: ['Name', 'ScheduleState', 'FormattedID', 'Severity', 'Iteration']
            });
        }
    },
    
    
    //Load and display Grid
    _createGrid: function(myStoryStore) {
        this.myGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStoryStore,
            columnCfgs: [
                'FormattedID',
                'Name',
                'Severity',
                'Iteration'
                ]
        });
        
        //console.log('my grid', myGrid);
        console.log('my grid');
        
        //console.log('what is this?', this);
        console.log('what is this?');
        
        this.add(this.myGrid);
    }
});

*/


/* Version 3

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    //Default funciton launched by app
    launch: function() {
        console.log('Test log to console');
        
        this.pulldownContainer = Ext.create('Ext.container.Container', {
            id: 'pulldown-container-id',
            layout: {
                type: 'hbox',
                align: 'stretch'
            }
        });
        
        
        this.add(this.pulldownContainer);
        
        
        this._loadIterations();
        
        //  this._loadData();
    },
    
    
    //Load Iterations
    _loadIterations: function() {
        //creating at app level (like global variable)
        this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
            //listeners is a config of IterationComboBox, listeners contains events
            listeners: {
                //ready is an event of IterationComboBox
                ready: function(combobox) {
                    //this._loadData();
                    this._loadSeverities();
                },
                //on combobox selection change
                select: function (combobox, records) {
                    this._loadData();
                },
                scope: this
            }
        });
        
        this.pulldownContainer.add(this.iterComboBox);
    },
    
    
    //Load Severities
    _loadSeverities: function() {
        this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
            model: 'Defect',
            field: 'Severity',
            listeners: {
                ready: function(combobox) {
                    this._loadData();
                },
                select: function (combobox, records) {
                    this._loadData();
                },
                scope: this
            }
        });
        
        this.pulldownContainer.add(this.severityComboBox);
    },
    
    
    //Load data from Rally
    _loadData: function() {
        //gets selected item from drop down
        var selectedIterRef = this.iterComboBox.getRecord().get('_ref');
        console.log('Selected Iteration:', selectedIterRef);
        
        var selectedSevValue = this.severityComboBox.getRecord().get('value');
        console.log('Selected Severity:', selectedSevValue);
       
        var myStore = Ext.create('Rally.data.wsapi.Store', {
            model: 'Defect',
            autoLoad: true,
            filters: [
                    {
                       property: 'Iteration',
                       operation: '=',
                       value: selectedIterRef
                    },
                    {
                        property: 'Severity',
                        operation: '=',
                        value: selectedSevValue
                    }
                ],
            listeners: {
                load: function(myStore, myData, success) {
                    //console.log('got data', myStore, myData, success);
                    console.log('got data');
                    
                    this._loadGrid(myStore);
                },
                scope: this
            },
            fetch: ['Name', 'ScheduleState', 'FormattedID', 'Severty', 'Iteration']
        });
    },
    
    
    //Load and display Grid
    _loadGrid: function(myStoryStore) {
        var myGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStoryStore,
            columnCfgs: [
                'FormattedID',
                'Name',
                'Severity',
                'Iteration'
                ]
        });
        
        //console.log('my grid', myGrid);
        console.log('my grid');
        
        //console.log('what is this?', this);
        console.log('what is this?');
        
        this.add(myGrid);
    }
});

*/


/*  Version 2

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    items: [
        {html: 'my-first-app'},
        {xtype: 'rallyreleasecombobox'},
        {xtype: 'rallyiterationcombobox'}
    ],
    //layout: 'hbox',
    
    
    //Default funciton launched by app
    launch: function() {
        console.log('Test log to console');
        
        this._loadData();
    },
    
    
    //Load data from Rally
    _loadData: function() {
        var myStore = Ext.create('Rally.data.wsapi.Store', {
            model: 'User Story',
            autoLoad: true,
            listeners: {
                load: function(myStore, myData, success) {
                    console.log('got data', myStore, myData, success);
                    
                    this._loadGrid(myStore);
                },
                scope: this
            },
            fetch: ['Name', 'ScheduleState', 'FormattedID']
        });
    },
    
    
    //Load and display Grid
    _loadGrid: function(myStoryStore) {
        var myGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStoryStore,
            columnCfgs: [
                'FormattedID',
                'Name',
                'ScheduleState'
                ]
        });
        
        console.log('my grid', myGrid);
        
        console.log('what is this?', this);
        this.add(myGrid);
    }
});

*/


/*  Original code

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        //Write app code here
        console.log('Test log to console');
        
        var myStore = Ext.create('Rally.data.wsapi.Store', {
            model: 'User Story',
            autoLoad: true,
            listeners: {
                load: function(myStore, myData, success) {
                    console.log('got data', myStore, myData, success);
                    //process data
                    
                    var myGrid = Ext.create('Rally.ui.grid.Grid', {
                        store: myStore,
                        columnCfgs: [
                            'FormattedID',
                            'Name',
                            'ScheduleState'
                            ]
                    });
                    
                    console.log('my grid', myGrid);
                    
                    console.log('what is this?', this);
                    this.add(myGrid);
                },
                scope: this
            },
            fetch: ['Name', 'ScheduleState', 'FormattedID']
        });

        //API Docs: https://help.rallydev.com/apps/2.0/doc/
    }
});

*/
