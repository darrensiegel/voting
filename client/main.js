Template.body.helpers({
    user: function () {
        return Session.get("user");
    }
});

Template.enterRoom.events({
    'click #enterRoomId': function (event, template) {
        event.preventDefault();
        var room = template.$('[id=roomId]').val();
        var user = template.$('[id=userId]').val();

        Meteor.call("join", room, user, function (error, result) {
                if (result) {
                    Session.set("user", user);
                    Session.set("room", room);
                }

            } );
    }
});

Template.createRoom.events({
    'click #createRoomId': function (event, template) {
        event.preventDefault();
        var room = template.$('[id=createId]').val();

        Meteor.call("create", room, function (error, result) {
            if (result) {
                Session.set("user", "admin");
                Session.set("room", room);
            }

        } );
    }
});

var getValidVotes = function() {
    return Voting.Votes.find({room: Session.get("room"), vote: { $ne: "-" } }).fetch();
};

var sumVotes = function() {
    var votes = getValidVotes();

    if (votes.length == 0) return { sum: 0, count: 0};

    var sum = votes.map(function(vote) {
        return vote.vote;
    }).reduce(function(prev, current) {
        return prev + current;
    });
    return { sum: sum, count: votes.length };
};

Template.room.helpers({
    voters: function () {
        return Voting.Votes.find({room: Session.get("room")});
    },
    isAdmin: function() {
        var room = Voting.Rooms.findOne({room: Session.get("room")});
        return room.admin === Session.get("user");
    },
    revealed: function() {
        var room = Voting.Rooms.findOne({room: Session.get("room")});
        return room.revealed;
    },
    roomName: function() {
        return Session.get("room");
    },
    mean: function() {
        var votes = getValidVotes();

        if (votes.length == 0) return 0;

        var sum = votes.map(function(vote) {
            return vote.vote;
        }).reduce(function(prev, current) {
            return parseInt(prev) + parseInt(current);
        });
        var avg = sum / votes.length;
        return avg.toFixed(2);
    },
    mode: function() {
        var votes = getValidVotes();

        var counts = {};
        var maxCount = 0;
        var maxValue = 0;
        votes.forEach(function(vote) {
           if (counts[vote.vote] === undefined) {
               counts[vote.vote] = 0;
           }
            counts[vote.vote] = counts[vote.vote] + 1;

            if (counts[vote.vote] > maxCount) {
                maxCount = counts[vote.vote];
                maxValue = vote.vote;
            }
        });

        return maxValue;
    }
});

Template.room.events({
    'click #reveal': function (event) {
        event.preventDefault();
        Meteor.call("reveal", Session.get("room"));
    },
    'click #reset': function (event) {
        event.preventDefault();
        Meteor.call("reset", Session.get("room"));
    },
    'change select': function (event, template) {
        event.preventDefault();
        var vote = template.$('[id=voteId]').val();
        Meteor.call("vote", Session.get("room"), Session.get("user"), vote,
        function(error, result) {
            console.log(result);
        });
    }

});


Template.voter.helpers({
   currentVote: function() {
       if (Voting.Rooms.findOne({room: Session.get("room")}).revealed) {
           return this.vote;
       } else {
           if (this.vote === "-") {
               return "-";
           } else {
               return "?";
           }
       }
   }
});