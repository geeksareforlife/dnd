var DiceRoller = {
    return: {},

    roll: function(diceText)
    {
        console.log("rolling: " + diceText);
        this.return = {
            'diceText': diceText
        };

        var parts = this.getParts(diceText);

        this.return.parts = [];

        var sum = 0;

        for (var i = 0; i < parts.length; i++) {
            var result = this.evaluate(parts[i][1]);

            this.return.parts[i] = {
                'text': parts[i][1],
            };

            if (typeof result == 'number') {
                this.return.parts[i].type = 'modifier';
                this.return.parts[i].result = result;
            } else {
                this.return.parts[i].type = 'diceroll';
                this.return.parts[i].result = result.result;
                this.return.parts[i].dice = result.dice;
            }

            sum = sum + this.return.parts[i].result
        }

        this.return.result = sum;
        console.log(this.return);
        return this.return;
    },

    getParts: function(diceText)
    {
        diceText = diceText.toLowerCase().replaceAll(' ', '');

        var regex = /([\-+]?[0-9d]+)/g;

        return [...diceText.matchAll(regex)];
    },

    evaluate: function(diceText)
    {
        if (diceText.indexOf('d') == -1) {
            // just convert to a number
            return parseInt(diceText, 10);
        } else {
            // we have some dice to roll, finally!
            var parts = diceText.split('d');
            var numDice = parts[0];
            var sizeDice = parts[1];
            var sign = "1";

            if (numDice < 0) {
                sign = "-1";
                numDice = Math.abs(numDice);
            }

            var sum = 0;
            var dice = [];

            for (var i = 0; i < numDice; i++) {
                var result = this.rollDice(sizeDice);
                dice[dice.length] = result;
                sum = sum + result;
            }

            return {
                result: sign * sum,
                dice: dice
            };
        }
    },

    rollDice: function(size)
    {
        var int = Math.floor(Math.random() * Math.floor(size));
        return int + 1;
    }
}

