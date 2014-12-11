Meteor.methods({

  vote: function (room, voter, vote) {

    var existingRoom = Voting.Rooms.findOne({ room: room});

    if (!existingRoom.revealed) {
      var params = { voter: voter, room: room};
      var current = Voting.Votes.findOne(params);
      if (current !== undefined && current !== null) {
        current.vote = vote;
        Voting.Votes.update(current._id, current);
      }

    }
    return true;
  },

  reveal: function (room) {
    var current = Voting.Rooms.findOne({room: room});
    current.revealed = true;
    Voting.Rooms.update(current._id, current);
  },

  reset: function(room) {

    Voting.Votes.update({ room: room}, {$set: {'vote': "-"}}, {multi: true});
    var current = Voting.Rooms.findOne({room: room});
    current.revealed = false;
    Voting.Rooms.update(current._id, current);

  },

  join: function(room, voter) {

    var existingRoom = Voting.Rooms.findOne({ room: room});
    if (existingRoom === undefined || existingRoom === null) {
      Voting.Rooms.insert({ room: room, admin: voter, revealed: false});
      return true;
    }

    var user = Voting.Votes.findOne({ room: room, voter: voter});
    if (user !== undefined && user !== null) {
      return false;
    }
    Voting.Votes.insert({ room: room, voter: voter, vote: "-"});
    return true;
  },

  create: function(room) {

    var existingRoom = Voting.Rooms.findOne({ room: room});
    if (existingRoom === undefined || existingRoom === null) {
      Voting.Rooms.insert({ room: room, admin: "admin", revealed: false});
      return true;
    }

    return false;
  }
});