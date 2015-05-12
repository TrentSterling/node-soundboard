define(["jquery", "socketio", "./utils/player", "./utils/stats", 'goog!visualization,1.1,packages:[line]'],
    function ($, io, player, stats) {
        var socket = io();

        if ($("sounds-list").length > 0) {
            $(":root").on("play", "sound-button",
                function (e) {
                    alert('got event');
                    var target = "remote";
                    switch (target) {
                        case "remote":
                            player.playSoundRemote(this.file);
                            break;
                        case "broadcast":
                            socket.emit('play', this.file);
                            break;
                        case "local":
                            player.playSoundLocal(this.file);
                            break;
                        default:
                    }
                });

            socket.on('files', function (files) {
                $("sounds-list").get(0).files = files;
            });

            socket.emit('files');

        } else {
            var getTarget = function () {
                return $('header button.active').attr('data-target');
            }

            // User clicked on sound button
            $(document).on("click", ".button", function (e) {
                var soundfile, target, $this;

                $this = $(this);
                soundfile = $this.attr("data-sound");
                target = getTarget();

                e.preventDefault();
                $this.toggleClass('button-clicked');

                switch (target) {
                    case "remote":
                        player.playSoundRemote(soundfile);
                        break;
                    case "broadcast":
                        socket.emit('play', soundfile);
                        break;
                    case "local":
                        player.playSoundLocal(soundfile);
                        break;
                    default:
                }

            });
            // Server gives us a play direction
            socket.on('play', function (soundfile) {
                player.playSoundLocal(soundfile);
            });

            socket.on('cache', function (soundfile) {
                player.cacheSound(soundfile);
            });

            $('header button').on('click', function (e) {
                $('header button.active').removeClass('active')
                $(this).addClass('active');
                return false;
            });
            /*
                    // Get all sounds
                    var soundFiles = $('.button').map(
                        function(index, element) {
                            return $(element).attr('data-sound');
                        }).get();
            
                    // Get stats for all sounds
                    stats.getStats(soundFiles, function(err, stats) {
            
                        // Merge into one list of clicks
                        var allClicks = [];
                        stats.forEach(function(clicks) {
                            allClicks = allClicks.concat(clicks);
                        });
            
                        // Sort on date
                        allClicks.sort(function(a, b) {
                            return a.date - b.date;
                        });
            
                        // Create the data table.
                        var dataTable = new google.visualization.DataTable();
            
                        // Create the column and reset click counters
                        var clickCounter = [];
                        dataTable.addColumn('date', 'Date');
                        soundFiles.forEach(function(soundfile) {
                            dataTable.addColumn('number', soundfile);
                            clickCounter[soundfile] = 0;
                        });
            
                        // Create the rows, date + click count (updated based on each click iterated over)
                        var rows = [];
                        allClicks.forEach(function(click) {
                            var row = [click.date];
                            clickCounter[click.soundfile]++;
            
                            soundFiles.forEach(function(soundfile) {
                                row.push(clickCounter[soundfile]);
                            });
            
                            rows.push(row);
                        });
            
                        dataTable.addRows(rows);
            
                        // Set chart options
                        var options = {
                            'title': 'Stats',
                            'width': '100%',
                            'height': 300
                        };
            
                        // Draw chart!
                        var chart = new google.charts.Line(document.getElementById('chart_div'));
                        chart.draw(dataTable, options);
                    });
            */
        }
    });
