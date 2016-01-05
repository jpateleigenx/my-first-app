Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
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
        
    },

    
    
    
/*    
    //original code
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
*/


});