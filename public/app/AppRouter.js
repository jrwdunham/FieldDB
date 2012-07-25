define([ 
    "backbone",
    "data_list/DataList",
    "datum/Session",
    "datum/SessionEditView",
    "user/UserMask",
    "libs/Utils"
], function(
    Backbone,
    DataList,
    Session,
    SessionEditView,
    UserMask
) {
  var AppRouter = Backbone.Router.extend(
  /** @lends AppRouter.prototype */
  {
    /**
     * @class Routes URLs to different dashboard layouts and data.As backbone is
     *        a one page app, this shows and hides different "pages", for
     *        example it starts out with a full screen dashboard view, with
     *        datalist and a datum, but when the user clicks the full screen
     *        buttons or uses the navigation menu, and it also happens any time
     *        the URL changes it will make the component full screen by hiding
     *        and showing divs using jquery.
     * 
     * @extends Backbone.Router
     * @constructs
     */
    initialize : function() {
    },

    routes : {
      "corpus/:corpusid"                : "showFullscreenCorpus", 
      "corpus/:corpusname/datum/:id"    : "showEmbeddedDatum", //corpusname has to match the pouch of the datum
      "corpus/:corpusname/search"       : "showAdvancedSearch",//corpusname has to match the pouch of the corpus
      "corpus/"                         : "showFullscreenCorpus", 
      "data/:dataListid"                : "showFullscreenDataList",
      "session/:sessionid"              : "showFullscreenSession",
      "user/:userid"                    : "showFullscreenUser",
      "import"                          : "showImport",
      ""                                : "showDashboard"
    },
    
    /**
     * Displays the dashboard view of the given corpusname, if one was given. Or
     * the blank dashboard view, otherwise.
     * 
     * @param {String}
     *          corpusname (Optional) The name of the corpus to display.
     */
    showDashboard : function() {
      Utils.debug("In showDashboard: " );
      this.showEditableDatums("centreWell");
    },
    /**
     * Displays the public user page view of the given userid, if their public user is stored in this pouch.
     */
    showFullscreenUser : function(userid, corpusname) {
      Utils.debug("In showFullscreenUser: " + userid);

      if(userid){
        if(!corpusname){
          corpusname = app.get("corpus").get("corpusname");
        }
        //if it is someone different, then change the model.
        if(userid != window.appView.publicReadUserView.model.id){
          var userToShow = new UserMask();
          userToShow.id = userid;
          userToShow.changeCorpus(corpusname, function(){
            //fetch only after having setting the right pouch which is what changeCorpus does.
            userToShow.fetch({
              success : function(model) {
                Utils.debug("Corpus member fetched successfully" +model);
                window.appView.setUpAndAssociatePublicViewsAndModelsWithCurrentUserMask(model);
              },
              error : function(e) {
                alert("User not found in this corpus.");
              }
            });
          });
        }
      }
      this.hideEverything();
      $("#public-user-page").show();
    },

    /**
     * Displays all of the corpus details and settings. 
     * 
     * @param {String}
     *          corpusname The name of the corpus this datum is from.
     */
    showFullscreenCorpus : function() {
      Utils.debug("In showFullscreenCorpus: " );

      //TODO create a public corpus mask, think of how to store it, and render that here.
      
      this.hideEverything();
      $("#corpus-fullscreen").show();
    },
    /**
     * Displays all of the corpus details and settings. 
     * 
     */
    showEmbeddedCorpus : function() {
      Utils.debug("In showEmbeddedCorpus: " );

      this.hideEverything();
      $("#dashboard-view").show();
      $("#corpus-embedded").show();
    },
    
    /**
     * Displays the advanced search in fullscreen form.
     */
    showFullscreenSearch : function(corpusname, corpusid) {
      this.hideEverything();
      window.appView.searchFullscreenView.render();
      $("#search-fullscreen").show();
    },
    
    /**
     * Displays the advanced search in embedded form.
     */
    showEmbeddedSearch : function(corpusname, corpusid) {
      this.hideEverything();
      $("#dashboard-view").show();
      window.appView.searchEmbeddedView.render();
      $("#search-embedded").show();
    },
    
    /**
     * Displays the fullscreen view of the session specified by the given
     * corpusname and the given datumid.
     * 
     * @param {String}
     *          corpusname The name of the corpus this datum is from, this needs to direclty match its pouch.
     * @param {Number}
     *          sessionid The ID of the session within the corpus.
     */
    showEmbeddedSession : function(sessionid, corpusname) {
      Utils.debug("In showEmbeddedSession: " + corpusname + " *** "
          + sessionid);
      if(sessionid){
        if(!corpusname){
          corpusname = window.app.get("corpus").get("corpusname");
        }
        if( sessionid != window.app.get("currentSession").id ){
          var cs = new Session({
            "corpusname" : corpusname});
          cs.id = sessionid;
          
          //this could move the corpus to the wrong couch if someones tries to see a datalist that is not in the current corpus, the current corpus might try to move to another pouch.
          if(window.app.get("corpus").get("corpusname") != corpusname ){
            alert("You are opening a session which is not in this corpus. Do you want to switch to the other corpus?");//TODO need nodejs to find out where that data list is from, in general we cant do this, nor should we.  we should jsut tell them data list not found in their database. since the only way to get to a data list now is through a corpus details page, this situation should not arrise.
          }
          
          cs.changeCorpus(corpusname, function(){
            //fetch only after having setting the right pouch which is what changeCorpus does.
            cs.fetch({
              success : function(model) {
                Utils.debug("Session fetched successfully" +model);
                cs.setAsCurrentSession( function(){
                  window.appView.setUpAndAssociateViewsAndModelsWithCurrentSession(function(){
                    window.appView.renderEditableSessionViews();
                    window.appView.renderReadonlySessionViews();
                  });
                });
              },
              error : function(e) {
                alert("There was an error fetching the sessions. Loading defaults..."+e);
              }
            });
          });      
        }
      }
      
      // Display the edit session view and hide all the other views
      this.hideEverything();
      $("#dashboard-view").show();
      $("#session-embedded").show();
      
    },
    
    /**
     * Displays the fullscreen view of the session.
     */
    showFullscreenSession : function(sessionid, corpusname) {
      Utils.debug("In showFullscreenSession"  + corpusname + " *** "
          + sessionid);
      if(sessionid){
        if(!corpusname){
          corpusname = window.app.get("corpus").get("corpusname");
        }
        if( sessionid != window.app.get("currentSession").id ){
          var cs = new Session({
            "corpusname" : corpusname});
          cs.id = sessionid;
          
          //this could move the corpus to the wrong couch if someones tries to see a datalist that is not in the current corpus, the current corpus might try to move to another pouch.
          if(window.app.get("corpus").get("corpusname") != corpusname ){
            alert("You are opening a session which is not in this corpus. Do you want to switch to the other corpus?");//TODO need nodejs to find out where that data list is from, in general we cant do this, nor should we.  we should jsut tell them data list not found in their database. since the only way to get to a data list now is through a corpus details page, this situation should not arrise.
          }
          
          cs.changeCorpus(corpusname, function(){
            //fetch only after having setting the right pouch which is what changeCorpus does.
            cs.fetch({
              success : function(model) {
                Utils.debug("Session fetched successfully" +model);
                cs.setAsCurrentSession( function(){
                  window.appView.setUpAndAssociateViewsAndModelsWithCurrentSession(function(){
                    window.appView.renderEditableSessionViews();
                    window.appView.renderReadonlySessionViews();
                  });
                });
              },
              error : function(e) {
                alert("There was an error fetching the sessions. Loading defaults..."+e);
              }
            });
          });      
        }
      }
      
      this.hideEverything();
      $("#session-fullscreen").show();
    },
   
    /**
     * Displays the fullscreen view of the datalist specified by the given
     * corpusname and the given dataListid
     * 
     * @param {String}
     *          corpusname The name of the corpus this datalist is from.
     * @param {Number}
     *          dataListid The ID of the datalist within the corpus.
     */
    showFullscreenDataList : function(dataListid, corpusname) {
      Utils.debug("In showFullscreenDataList: " + corpusname + " *** "
          + dataListid);

      if(dataListid){
        if(!corpusname){
          corpusname = window.app.get("corpus").get("corpusname");
        }
        var dl = new DataList({
          "corpusname" : corpusname});
        dl.id = dataListid;

        //this could move the corpus to the wrong couch if someones tries to see a datalist that is not in the current corpus, the current corpus might try to move to another pouch.
        if(window.app.get("corpus").get("corpusname") != corpusname ){
          alert("You are opening a data list which is not in this corpus. Do you want to switch to the other corpus?");//TODO need nodejs to find out where that data list is from, in general we cant do this, nor should we.  we should jsut tell them data list not found in their database. since the only way to get to a data list now is through a corpus details page, this situation should not arrise.
        }
        
        dl.changeCorpus(corpusname, function(){
          //fetch only after having setting the right pouch which is what changeCorpus does.
          dl.fetch({
            success : function(e) {
              Utils.debug("Datalist fetched successfully" +e);
              dl.setAsCurrentSession( function(){
                window.appView.setUpAndAssociateViewsAndModelsWithCurrentDataList(function(){
                  window.appView.renderEditableDataListViews();
                  window.appView.renderReadonlyDataListViews();
                });
              });
            },
            error : function(e) {
              alert("There was an error fetching the data list. Loading defaults..."+e);
            }
          });
        });
      }
      this.hideEverything();
      $("#data-list-fullscreen").show();      
    },
    
    showMiddleDataList : function(dataListid, corpusname) {
      Utils.debug("In showMiddleDataList");

      if(dataListid){
        if(!corpusname){
          corpusname = window.app.get("corpus").get("corpusname");
        }
        var dl = new DataList({
          "corpusname" : corpusname});
        dl.id = dataListid;

        //this could move the corpus to the wrong couch if someones tries to see a datalist that is not in the current corpus, the current corpus might try to move to another pouch.
        if(window.app.get("corpus").get("corpusname") != corpusname ){
          alert("You are opening a data list which is not in this corpus. Do you want to switch to the other corpus?");//TODO need nodejs to find out where that data list is from, in general we cant do this, nor should we.  we should jsut tell them data list not found in their database. since the only way to get to a data list now is through a corpus details page, this situation should not arrise.
        }
        
        dl.changeCorpus(corpusname, function(){
          //fetch only after having setting the right pouch which is what changeCorpus does.
          dl.fetch({
            success : function(e) {
              Utils.debug("Datalist fetched successfully" +e);
              dl.setAsCurrentSession( function(){
                window.appView.setUpAndAssociateViewsAndModelsWithCurrentDataList(function(){
                  window.appView.renderEditableDataListViews();
                  window.appView.renderReadonlyDataListViews();
                });
              });
            },
            error : function(e) {
              alert("There was an error fetching the data list. Loading defaults..."+e);
            }
          });
        });
      }
      this.hideEverything();
      $("#dashboard-view").show();
      $("#data-list-embedded").show();      
    },
    
    /**
     * Display the fullscreen view of search within the corpus specified by the
     * given corpusname.
     * 
     * @param {String}
     *          corpusname The name of the corpus to search in.
     */
    showAdvancedSearch : function(corpusname) {
      Utils.debug("In showAdvancedSearch: " + corpusname);

      this.hideEverything();
      $("#search-fullscreen").show();
    },

    showImport : function() {
      Utils.debug("In import: ");

      this.hideEverything();
      $('#import-fullscreen').show();
    },
    
    showExport : function(corpusname) {
      Utils.debug("In showExport: " + corpusname);

      this.hideEverything();
      $("#dashboard-view").show();
      $('#export-modal').modal("show");
    },
    
    //Functions that toggle between editable and readonly corpus views
    showEditableCorpus : function(corpusid){
      window.appView.renderEditableCorpusViews(corpusid);
    },
    showReadonlyCorpus : function(corpusid){
      window.appView.renderReadonlyCorpusViews(corpusid);
    },
    
    //Functions that toggle between editable and readonly session views
    showEditableSession : function(sessionid){
      window.appView.renderEditableSessionViews(sessionid);
    },
    showReadonlySession : function(sessionid){
      window.appView.renderReadonlySessionViews(sessionid);
    },
    
    //Functions that toggle between editable and readonly session views
    showEditableDataList : function(datalistid){
      window.appView.renderEditableDataListViews(datalistid);
    },
    showReadonlyDataList : function(datalistid){
      window.appView.renderReadonlyDataListViews(datalistid);
    },
    
    // Functions that toggle between editable and readonly datums view
    showEditableDatums : function(format) {
      window.appView.renderEditableDatumsViews(format);
      if (format == "centreWell") {
        this.hideEverything();
        $("#dashboard-view").show();
        $("#datums-embedded").show();
        window.location.href = "#"; //TODO this is to clear the parameters in the url
      } else if (format == "fullscreen") {
        this.hideEverything();
        $("#datum-container-fullscreen").show();
      }
    },
    showReadonlyDatums : function(format) {
      window.appView.renderReadonlyDatumsViews(format);
      if (format == "centreWell") {
        this.hideEverything();
        $("#dashboard-view").show();
        $("#datums-embedded").show();
        window.location.href = "#"; //TODO this is to clear the parameters in the url
      } else if (format == "fullscreen") {
        this.hideEverything();
        $("#datum-container-fullscreen").show();
      }
    },
    
    hideEverything: function() {
      $("#dashboard-view").hide();
      $("#datums-embedded").hide();
      $("#data-list-fullscreen").hide();
      $("#datum-container-fullscreen").hide();
      $("#corpus-embedded").hide();
      $("#corpus-fullscreen").hide();
      $("#search-fullscreen").hide();
      $("#search-embedded").hide();
      $("#session-embedded").hide();
      $("#session-fullscreen").hide();
      $('#public-user-page').hide();
      $('#user-fullscreen').hide();
      $('#import-fullscreen').hide();
      $('#data-list-embedded').hide();
    }
  });

  return AppRouter;
});
