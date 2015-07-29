var CORS = require("../CORS");
var Q = require("q");
var BASE_LEXICON_NODE = require("../datum/LanguageDatum").LanguageDatum;
var DEFAULT_CORPUS = require("./../../api/corpus/corpus.json");

var escapeRegexCharacters = function(regex) {
  return regex.replace(/([()[{*+.$^\\|?])/g, "\\$1");
};

/**
 * @class Lexicon Node is key value pair with an index of related datum. It allows the search to index
 *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
 * 
 * @description Lexicon Node is key value pair with an index of related datum. It allows the search to index
 *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
 * 
 * 
 * @extends LanguageDatum
 * 
 * @constructs
 * 
 */
var LexiconNode = function(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "LexiconNode";
  }
  // this.debugMode = true;
  BASE_LEXICON_NODE.apply(this, arguments);

  if (typeof this.toJSON === "function") {
    this.fossil = this.toJSON();
  } else {
    this.fossil = {};
    this.expandedIGTFields.map(function(field) {
      if (field && this[field]) {
        this.fossil[field] = this[field];
      }
    });
  }
};

LexiconNode.prototype = Object.create(BASE_LEXICON_NODE.prototype, /** @lends LexiconNode.prototype */ {
  constructor: {
    value: LexiconNode
  },

  api: {
    value: "lexicalNodes"
  },

  /**
   *  Lexical entries/Nodes unique id is composed of their morphemes and gloss.
   *  However, the user can edit the id/headword if there really are more
   *  than one morpheme with the exact same morphemes and gloss combo.
   * @return {[type]} [description]
   */
  id: {
    get: function() {
      return this.headword;
    },
    set: function(value) {
      this.headword = value;
    }
  },

  headword: {
    get: function() {
      if (!this._id) {
        var constructHeadwordFromMorphemesAndGloss = "";
        if (this.morphemes) {
          constructHeadwordFromMorphemesAndGloss = this.morphemes;
        }
        constructHeadwordFromMorphemesAndGloss += "|";
        if (this.gloss) {
          constructHeadwordFromMorphemesAndGloss += this.gloss;
        }
        if (constructHeadwordFromMorphemesAndGloss) {
          this._id = constructHeadwordFromMorphemesAndGloss;
        }
      }
      return this._id;
    },
    set: function(value) {
      this._id = value;
    }
  },

  count: {
    get: function() {
      return this._count || 0;
    },
    set: function(value) {
      this._count = value;
    }
  },

  categories: {
    get: function() {
      return this.syntacticCategory.split(/\s+/);
    },
    set: function(value) {
      this.syntacticCategory = value.join(" ");
    }
  },
  
  datumids: {
    get: function() {
      return this.relatedData;
    },
    set: function(value) {
      this.relatedData = value;
    }
  },

  corpus: {
    get: function() {
      if (this.parent && this.parent.corpus) {
        return this.parent.corpus;
      }
      if (this._corpus) {
        return this._corpus;
      }
    },
    set: function(value) {
      if (this.parent) {
        return;
      }
      this._corpus = value;
    }
  },

  addField: {
    value: function(field) {
      if (!this.fields) {
        if (!this.corpus || !this.corpus.datumFields || !this.corpus.datumFields.length) {
          this.fields = JSON.parse(JSON.stringify(DEFAULT_CORPUS.datumFields));
        }
      }
      return BASE_LEXICON_NODE.prototype.addField.apply(this, arguments);
    }
  },

  uniqueEntriesOnHeadword: {
    value: function(a, b) {
      if (a && !b && this._fieldDBtype === "LexiconNode") {
        a = this;
        b = a;
      }
      // console.log(" checking headword equality ", a.headword, b.headword);

      var equal = true;
      var fieldIndex,
        field,
        tmpArray;

      if (!a || !b) {
        equal = false;
        return equal;
      }

      if (a.headword !== b.headword) {
        // console.log(" Head words dont match " + a.headword + " vs " + b.headword)
        equal = false;
        return equal;
      }
      return equal;
    }
  },

  equalDepreated: {
    value: function(b) {
      console.log(" checking equality ", this.headword, b.headword);

      var a = this;
      var equal = true;
      var fieldIndex,
        field,
        tmpArray;

      if (!a || !b) {
        equal = false;
        return equal;
      }

      if (a.headword !== b.headword) {
        equal = false;
        return equal;
      }

      this.debug(" checking expandedIGTFields", this.expandedIGTFields);
      for (fieldIndex in this.expandedIGTFields) {
        field = this.expandedIGTFields[fieldIndex];
        if (a.hasOwnProperty(field)) {
          this.debug(field);
          if (a[field] !== b[field]) {
            equal = false;
          }
        }
      }
      // If the nodes are "equal" then make sure they have the same combineFieldsIfEqual
      if (equal) {
        for (fieldIndex in this.combineFieldsIfEqual) {
          field = this.combineFieldsIfEqual[fieldIndex];
          if (a.hasOwnProperty(field)) {
            tmpArray = [];
            a[field] = a[field].concat(b[field]);
            /*jshint loopfunc: true */
            a[field].map(function(item) {
              if (tmpArray.indexOf(item) === -1) {
                tmpArray.push(item);
              }
            });
            a[field] = tmpArray;
            b[field] = tmpArray;
          }
        }
        if (a.confidence && b.confidence) {
          a.confidence = (parseFloat(a.confidence, 10) + parseFloat(b.confidence, 10)) / 2;
          b.confidence = a.confidence;
        }
        if (a.allomorphs || b.allomorphs) {
          var allomorphs = a.allomorphs ? a.allomorphs : "";
          allomorphs = allomorphs + allomorphs ? ", " : "";
          allomorphs = allomorphs + b.allomorphs ? b.allomorphs : "";
          a.allomorphs = allomorphs;
          b.allomorphs = allomorphs;
        }
      }
      return equal;
    }
  },
  expandedIGTFields: {
    value: ["morphemes", "gloss", "allomorphy", "phonetic", "orthography"]
  },
  combineFieldsIfEqual: {
    value: ["datumids", "utteranceContext"]
  },
  sortBy: {
    value: "headword",
    writable: true
  },

  compare: {
    value: function(a, b) {
      if (a && !b && this._fieldDBtype === "LexiconNode") {
        a = this;
        b = a;
      }
      var result = 0;
      var sortBy = a.sortBy;

      if (!b || !b || !b[this.sortBy]) {
        return -1;
      }
      if (!a || !a || !a[this.sortBy]) {
        return 1;
      }
      if ((typeof(a[sortBy]) === "number") && (typeof(b[sortBy]) === "number")) {
        result = a[sortBy] - b[sortBy];
      } else if ((typeof(a[sortBy]) === "string") && (typeof(b[sortBy]) === "string")) {
        if (a[sortBy] < b[sortBy]) {
          result = -1;
        } else if (a[sortBy] > b[sortBy]) {
          result = 1;
        } else {
          result = 0; // Same, so cannot be both in the lexicon since they are the same
        }
      } else if (typeof(a[sortBy]) === "string") {
        result = 1;
      } else {
        result = -1;
      }
      return result;
    }
  },

  clean: {
    value: function() {
      // console.log("Preparing datum with this lexical entry to be cleaned...");
      var deffered = Q.defer();
      this.cleanedData = [];
      var promises = [];
      var self = this;
      this.proposedChanges = [];

      var successFunction = function(doc) {
        if (BASE_LEXICON_NODE && BASE_LEXICON_NODE.prototype.INTERNAL_MODELS) {
          doc = new BASE_LEXICON_NODE(doc);
        }
        // console.log(doc);
        doc.fields.map(function(datumField) {
          if (self.fossil[datumField.label] !== self[datumField.label] && (new RegExp(escapeRegexCharacters(self.fossil[datumField.label]), "i")).test(datumField.mask)) {
            var change = {
              before: datumField.mask + ""
            };
            // TODO this makes things lower case... because part of the map reduce seems to be doing that...
            datumField.mask = datumField.mask.replace(new RegExp(escapeRegexCharacters(self.fossil[datumField.label]), "ig"), self[datumField.label]);
            datumField.value = datumField.mask;
            change.after = datumField.mask;
            self.proposedChanges.push(change);
            return datumField;
          }
        });
        self.cleanedData.push(doc);
      };
      var failFunction = function(reason) {
        console.log(reason);
        self.bug("There was a problem opening your data. " + reason.userFriendlyErrors);
      };

      for (var idIndex = 0; idIndex < this.datumids.length; idIndex++) {
        // console.log(this.datumids.length[idIndex]);
        promises[idIndex] = CORS.makeCORSRequest({
          method: "GET",
          dataType: "json",
          url: this.url + "/" + this.datumids[idIndex]
        });
        promises[idIndex].then(successFunction).fail(failFunction);
      }
      Q.allSettled(promises).then(function(results) {
        deffered.resolve(self.proposedChanges);
      });
      return deffered.promise;
    }
  },
  save: {
    value: function() {
      var deffered = Q.defer(),
        self = this,
        promises = [];

      console.log("Saving cleaned datum...");
      while (this.cleanedData && this.cleanedData.length > 0) {
        var cleanedDatum = this.cleanedData.pop();
        promises.push(CORS.makeCORSRequest({
          method: "PUT",
          dataType: "json",
          data: cleanedDatum,
          url: this.url + "/" + cleanedDatum._id
        }));
      }
      Q.allSettled(promises).then(function(results) {
        results.map(function(result) {
          if (result.state === "fulfilled" && result.value && result.value.ok) {
            console.log("Your changes have been successfully saved! ", result.value);
          } else {
            self.bug("One of your changes was not saved " + cleanedDatum._id + " " + result.value.userFriendlyErrors.join("\n"));
          }
        });
        deffered.resolve(results);
        self.unsaved = true;
      });
      return deffered.promise;
    }
  },
  unsaved: {
    configurable: true,
    get: function() {
      if (this._unsaved) {
        return this._unsaved;
      }
      if (this.fossil && !this.equals(this.fossil)) {
        this._unsaved = true;
      }
      return this._unsaved;
    },
    set: function(value) {
      this._unsaved = value;
    }
  }
});

exports.LexiconNode = LexiconNode;
