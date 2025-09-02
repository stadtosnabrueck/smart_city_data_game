// Wait until the DOM is fully loaded
$(document).ready(function () {
    console.log("JQuery is ready. Loading config.");

    // Load configuration from the custom/config.json file
    $.getJSON("./custom/config.json", function (data) {
        
        // Variables for game state
        let timeCurrent          = undefined;  // current elapsed time
        let timerInterval        = undefined;  // interval for game timer
        let blocksInterval       = undefined;  // interval for showing new blocks
        let blocksFall           = undefined;  // animation interval for falling blocks
        let blocksClicked        = undefined;  // counter for clicked blocks
        let blocksOverall        = undefined;  // total blocks shown
        let shuffledBlocks       = undefined;  // randomized list of blocks
        let currentBlockIndex    = undefined;  // current block position in the shuffled list
        let blocksListClicked    = undefined;  // list of clicked block IDs
        let blocksListNotClicked = undefined;  // list of missed block IDs

        console.log("Config loaded:");
        console.log(data);

        console.log("Setting environment.");
        // Set page title and brand title from config
        document.title = data.title;
        $("#brand_title").html(data.title);

        console.log("Show overlay for start.");
        overlayStart();

        /**
         * Show the start overlay with intro text and button
         */
        function overlayStart() {
            $("#overlay_result").hide();
            $("#overlay_start_text").html(data.startText);
            $("#overlay_start_button").html(data.startButton);
            $("#time_limit").html("&nbsp;");            
            $("#overlay_start").show();
        }

        /**
         * Show the result overlay after the game ends
         */
        function overlayResult() {
            $("#overlay_start").hide();

            // Display results in overlay
            $("#overlay_result_text").html(data.resultText);
            $("#overlay_result_blocks").html(blocksClicked + " / " + blocksOverall);
            $("#overlay_result_time").html(timeCurrent + " s");

            $("#overlay_result").show();
        }

        /**
         * Start the game when user presses the start button
         */
        $("#overlay_start_button").on("click", function () {
            console.log("Game started.");

            // Reset counters
            timeCurrent       = 0;
            blocksClicked     = 0;
            blocksOverall     = 0;
            blocksListClicked = [];
            blocksListNotClicked = [];

            $("#overlay_start").hide();

            // Shuffle the blocks defined in config
            shuffledBlocks = data.blocks.sort(() => Math.random() - 0.5);
            currentBlockIndex = 0;

            // Start timers
            startTimer();
            startBlocks();
        });

        /**
         * Start the game timer
         */
        function startTimer() {
            clearInterval(timerInterval);
            timerInterval = setInterval(function () {
                timeCurrent++;
                $("#time_limit").html(timeCurrent + " s");

                // Stop game if time exceeds limit
                if (timeCurrent >= data.timeLimit) {
                    stopGame();
                }
            }, 1000);
        }

        /**
         * Start showing blocks at configured intervals
         */
        function startBlocks() {
            clearInterval(blocksInterval);
            blocksInterval = setInterval(function () {
                showBlock();
            }, data.blockInterval);
        }

        /**
         * Display a block on the game area
         */
        function showBlock() {
            if (currentBlockIndex >= shuffledBlocks.length) {
                // All blocks shown, end game
                stopGame();
                return;
            }

            const block = shuffledBlocks[currentBlockIndex];
            blocksOverall++;

            // Create block element
            const blockElement = $("<div>")
                .addClass("block")
                .text(block.label)
                .css({
                    left: Math.random() * ($("#game_area").width() - 100), // random x-position
                    top: -50 // start above screen
                });

            // Click handler for block
            blockElement.on("click", function () {
                blocksClicked++;
                blocksListClicked.push(block.label);
                $(this).remove();
            });

            // Add block to game area
            $("#game_area").append(blockElement);

            // Animate block falling down
            blockElement.animate(
                { top: $("#game_area").height() + 50 },
                data.blockFallTime,
                "linear",
                function () {
                    // If block was not clicked before reaching bottom
                    if ($(this).parent().length) {
                        blocksListNotClicked.push(block.label);
                        $(this).remove();
                    }
                }
            );

            currentBlockIndex++;
        }

        /**
         * Stop the game and show results
         */
        function stopGame() {
            clearInterval(timerInterval);
            clearInterval(blocksInterval);

            console.log("Game stopped.");
            overlayResult();
        }
    });
});
