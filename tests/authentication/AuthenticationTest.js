var Authentication = require("./../../api/authentication/Authentication").Authentication;
var SAMPLE_USERS = require("./../../sample_data/user_v1.22.1.json");
var specIsRunningTooLong = 5000;

describe("Authentication ", function() {

  it("should load", function() {
    expect(Authentication).toBeDefined();
  });

  it("should look up the user on the server if the app is online", function(done) {
    var auth = new Authentication();
    expect(auth).toBeDefined();

    try {
      auth.login({
        username: "jenkins",
        password: "phoneme"
      }).then(function(result) {
        auth.debug("Done authentication");
        expect(result).toBeDefined();
        expect(result).toEqual(" ");
      }, function(result) {
        auth.debug("Failed authentication");
        expect(result).toBeDefined();
        expect(result.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);
    } catch (e) {
      expect(e).toEqual(" ");
    }

  }, specIsRunningTooLong);

  describe("create corpora for users", function() {

    it("should be able to create a new corpus", function(done) {
      var auth = new Authentication();
      expect(auth).toBeDefined();

      auth.newCorpus({
        username: "jenkins",
        password: "phoneme",
        title: "Long distance anaphors in Quechua"
      }).then(function(result) {
        auth.debug("Done creating new corpus");
        expect(result).toBeDefined();
        expect(result).toEqual("Cannot be succesful in jasmine-node");
      }, function(error) {
        auth.debug("Failed creating new corpus");
        expect(error).toBeDefined();
        expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);

    }, specIsRunningTooLong);


    it("should be require the user to authenticate to create a new corpus", function(done) {
      var auth = new Authentication();
      expect(auth).toBeDefined();

      auth.newCorpus({
        username: "jenkins",
        title: "Long distance anaphors in Quechua"
      }).then(function(result) {
        auth.debug("Done creating new corpus");
        expect(result).toBeDefined();
        expect(result).toEqual("Cannot be succesful in jasmine-node");
      }, function(error) {
        auth.debug("Failed creating new corpus");
        expect(error).toBeDefined();
        expect(error.userFriendlyErrors).toEqual(["You must enter your password to prove that that this is you."]);
      }).done(done);

    }, specIsRunningTooLong);


    it("should require a new corpus title", function(done) {
      var auth = new Authentication();
      expect(auth).toBeDefined();

      auth.newCorpus({
        username: "jenkins",
        password: "phoneme"
      }).then(function(result) {
        auth.debug("Done creating new corpus");
        expect(result).toBeDefined();
        expect(result).toEqual("Cannot be succesful in jasmine-node");
      }, function(error) {
        auth.debug("Failed creating new corpus");
        expect(error).toBeDefined();
        expect(error.userFriendlyErrors).toEqual(["Please supply a title for your new corpus."]);
      }).done(done);

    }, specIsRunningTooLong);

  });

  describe("Offline", function() {
    it("should use a different random encryption key for each device", function() {
      var auth = new Authentication();
      expect(auth).toBeDefined();
    });

    it("should look up the user locally if the app is offline", function(done) {
      var auth = new Authentication();
      expect(auth).toBeDefined();

      expect(auth.resumingSessionPromise).toBeDefined();
      auth.resumingSessionPromise.then(function(result) {
        expect(result.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        expect(auth.user).toBeUndefined();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);

    }, specIsRunningTooLong);


    it("setting the user should indirectly cause the user to be saved locally", function(done) {
      var auth = new Authentication({
        // debugMode: true
      });
      expect(auth).toBeDefined();
      auth.user = {
        username: "sapir",
        // debugMode: true
      };
      expect(auth.user.fieldDBtype).toEqual("User");
      expect(auth.userMask).toBeUndefined();

      expect(SAMPLE_USERS[0].researchInterest).toContain("Phonemes");
      auth.user = JSON.parse(JSON.stringify(SAMPLE_USERS[0]));
      expect(auth.user).toBeDefined();
      expect(auth.user.researchInterest).toContain("Phonemes");

      /* should be saved */
      expect(auth.user.constructor.prototype.temp).toBeDefined();
      expect(auth.user.constructor.prototype.temp[auth.user.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C + "sapir"]).toBeDefined();
      expect(auth.user.constructor.prototype.temp[auth.user.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C + "sapir"]).toContain("confidential");

      var anotherAuthLoad = new Authentication({
        user: {
          username: "sapir"
        }
      });
      expect(anotherAuthLoad.user.warnMessage).toContain("Refusing to save a user doc which is incomplete");
      anotherAuthLoad.user.warnMessage = "";
      expect(anotherAuthLoad.user.constructor.prototype.temp)
        .toEqual(auth.user.constructor.prototype.temp);
      expect(anotherAuthLoad.user.constructor.prototype.temp[
          anotherAuthLoad.user.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C + "sapir"
        ])
        .toEqual(auth.user.constructor.prototype.temp[
          auth.user.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C + "sapir"
        ]);
      // user has default prefs for now
      expect(anotherAuthLoad.user.prefs).toBeUndefined();
      expect(anotherAuthLoad.user.fieldDBtype).toEqual("User");

      anotherAuthLoad.user.fetch().then(function() {
        expect(anotherAuthLoad.user.researchInterest).toContain("Phonemes");
        // user has their own prefs now
        expect(anotherAuthLoad.user.prefs.unicodes.length).toEqual(22);
        expect(anotherAuthLoad.user.prefs.numVisibleDatum).toEqual(2);
      }).done(done);

    }, specIsRunningTooLong);


  });

  it("should be able to register a user", function(done) {
    var auth = new Authentication();
    expect(auth).toBeDefined();

    auth.register({
      username: "jenkins",
      password: "phoneme",
      confirmPassword: "phoneme"
    }).then(function(result) {
      auth.debug("Done registering");
      expect(result).toBeDefined();
      expect(result).toEqual("Cannot be succesful in jasmine-node");
    }, function(error) {
      auth.debug("Failed registering");
      expect(error).toBeDefined();
      expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
    }).done(done);

  }, specIsRunningTooLong);


  it("should not log the user in if the server replies not-authenticated", function() {
    expect(true).toBeTruthy();
  });

  it("should not authenticate if login good username bad password", function() {
    //          var authenticated = u.login("lingllama", "hypothesis");
    //          expect(!authenticated).toBeTruthy();
  });

  it("should not authenticate if login bad username any password", function() {
    //          var authenticated = u.login("sapri", "phoneme");
    //          expect(!authenticated).toBeTruthy();
  });

  it("should authenticate if login good username good password", function() {
    //          var authenticated = u.login("lingllama", "phoneme");
    //          expect(authenticated).toBeTruthy();
  });
});
