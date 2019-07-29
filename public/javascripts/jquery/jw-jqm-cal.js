(function($) {
   $.jqmCalendar = function(element, options) {
      
      var defaults = {
         // Array of events
         events : [],
         // Default properties for events
         begin : "begin",
         end : "end",
         summary : "summary",
         // Theme
         theme : "c",
         // Date variable to determine which month to show and which date to select
         date : new Date(),
         // Array of month strings (calendar header)
         months : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
         // Array of day strings (calendar header)
         days : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
         // Most months contain 5 weeks, some 6. Set this to six if you don't want the amount of rows to change when switching months.
         weeksInMonth : undefined,
         // Start the week at the day of your preference, 0 for sunday, 1 for monday, and so on.
         startOfWeek : 0
      }

      var plugin = this;
      plugin.settings = null;

      var $element = $(element).addClass("jq-calendar-wrapper"),
          element = element,
          $table,
          $header,
          $tbody,
          $listview;

      function init() {
         console.log("jqm calendar init");
         plugin.settings = $.extend({}, defaults, options);       //병합 한다..
         $table = $("<table/>");
         
         // Build the header
         var $thead = $("<thead/>").appendTo($table),
            $tr = $("<tr/>").appendTo($thead),
            $th = $("<th class='ui-bar-" + plugin.settings.theme + " header' colspan='7'/>");
         
         $previous = $("<a href='#' data-role='button' data-icon='arrow-l' data-iconpos='notext' class='previous-btn'>Previous</a>").click(function(event) {
            refresh(new Date(plugin.settings.date.getFullYear(), plugin.settings.date.getMonth() - 1, plugin.settings.date.getDate()));
         }).appendTo($th);
         
         $header = $("<span/>").appendTo($th);
         
         $previous = $("<a href='#' data-role='button' data-icon='arrow-r' data-iconpos='notext' class='next-btn'>Next</a>").click(function(event) {
            refresh(new Date(plugin.settings.date.getFullYear(), plugin.settings.date.getMonth() + 1, plugin.settings.date.getDate()));
         }).appendTo($th);
         
         $th.appendTo($tr);
         
         $tr = $("<tr/>").appendTo($thead);
         
         // The way of determing the labels for the days is a bit awkward, but works.
         for ( var i = 0, days = [].concat(plugin.settings.days, plugin.settings.days).splice(plugin.settings.startOfWeek, 7); i < 7; i++ ) {
            $tr.append("<th class='ui-bar-" + plugin.settings.theme + "'><span class='hidden'>"  + days[i] + "</span></th>");
         }
         
         $tbody = $("<tbody/>").appendTo($table);
         
         $table.appendTo($element);
         $listview = $("<ul data-role='listview'/>").insertAfter($table);
         
         // Call refresh to fill the calendar with dates
         refresh(plugin.settings.date);      
      }


      function init2(newEvent) {
         console.log("jqm calendar init");
         plugin.settings = $.extend({}, defaults, newEvent);       //병합 한다..
         $element.empty();
         $table = $("<table/>");

         // Build the header
         var $thead = $("<thead/>").appendTo($table),
             $tr = $("<tr/>").appendTo($thead),
             $th = $("<th class='ui-bar-" + plugin.settings.theme + " header' colspan='7'/>");

         $previous = $("<a href='#' data-role='button' data-icon='arrow-l' data-iconpos='notext' class='previous-btn'>Previous</a>").click(function(event) {
            refresh(new Date(plugin.settings.date.getFullYear(), plugin.settings.date.getMonth() - 1, plugin.settings.date.getDate()));
         }).appendTo($th);

         $header = $("<span/>").appendTo($th);

         $previous = $("<a href='#' data-role='button' data-icon='arrow-r' data-iconpos='notext' class='next-btn'>Next</a>").click(function(event) {
            refresh(new Date(plugin.settings.date.getFullYear(), plugin.settings.date.getMonth() + 1, plugin.settings.date.getDate()));
         }).appendTo($th);

         $th.appendTo($tr);

         $tr = $("<tr/>").appendTo($thead);

         // The way of determing the labels for the days is a bit awkward, but works.
         for ( var i = 0, days = [].concat(plugin.settings.days, plugin.settings.days).splice(plugin.settings.startOfWeek, 7); i < 7; i++ ) {
            $tr.append("<th class='ui-bar-" + plugin.settings.theme + "'><span class='hidden'>"  + days[i] + "</span></th>");
         }

         $tbody = $("<tbody/>").appendTo($table);

         $table.appendTo($element);
         $listview = $("<ul data-role='listview'/>").insertAfter($table);

         // Call refresh to fill the calendar with dates
         refresh(plugin.settings.date);
      }
      
      function _firstDayOfMonth(date) {
         // [0-6] Sunday is 0, Monday is 1, and so on.
         return ( new Date(date.getFullYear(), date.getMonth(), 1) ).getDay();
      }
      
      function _daysBefore(date, fim) {
          // Returns [0-6], 0 when firstDayOfMonth is equal to startOfWeek, else the amount of days of the previous month included in the week.
         var firstDayInMonth = ( fim || _firstDayOfMonth(date) ),
             diff = firstDayInMonth - plugin.settings.startOfWeek;
         return ( diff > 0 ) ? diff : ( 7 + diff );
      }
      
      function _daysInMonth(date) {
         // [1-31]
         return ( new Date ( date.getFullYear(), date.getMonth() + 1, 0 )).getDate();
      }

      function _daysAfter(date, wim, dim, db) {
         // Returns [0-6] amount of days from the next month
         return    (( wim || _weeksInMonth(date) ) * 7 ) - ( dim || _daysInMonth(date) ) - ( db || _daysBefore(date));
      }
            
      function _weeksInMonth(date, dim, db) {
         // Returns [5-6];
         return ( plugin.settings.weeksInMonth ) ? plugin.settings.weeksInMonth : Math.ceil( ( ( dim || _daysInMonth(date) ) + ( db || _daysBefore(date)) ) / 7 );
      }
      
      function addCell($row, date, hidden, selected) {
         var $td = $("<td class='ui-body-" + plugin.settings.theme + "'/>").appendTo($row),
             $a = $("<a href='#' class='ui-btn ui-btn-up-" + plugin.settings.theme + "'/>")
                  .html(date.getDate().toString())
                  .data('date', date)
                  .click(cellClickHandler)
                  .appendTo($td);

         if ( selected ) $a.click();
         
         if ( hidden ) {
             $td.addClass("hidden");
         } else {
            var importance = 0;
            
            // Find events for this date
            for ( var i = 0,
                      event,
                      begin = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
                      end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
                  event = plugin.settings.events[i]; i++ ) {
               if ( event[plugin.settings.end] > begin && event[plugin.settings.begin] < end ) {
                  importance++;
                  if ( importance > 2 ) break;
               }
            }
            
            if ( importance > 0 ) {
                $a.append("<span>&bull;</span>").addClass("importance-" + importance.toString() );
            }
         }
      }

      //달력 클릭했을 때 이벤트 핸들러러
     function cellClickHandler(event) {
        console.log("cell clicked..");
         var $this = $(this),
            date = $this.data('date');
         $tbody.find("a.ui-btn-active").removeClass("ui-btn-active");
         $this.addClass("ui-btn-active");
         
         if ( date.getMonth() !== plugin.settings.date.getMonth() ) {
            // Go to previous/next month
            refresh(date);
         } else {
            // Select new date
            $element.trigger('change', date);
         }
      }
      
      function refresh(date) {
         plugin.settings.date = date = date ||  plugin.settings.date || new Date();
                  
         var year = date.getFullYear(),
            month = date.getMonth(),
            daysBefore = _daysBefore(date),
            daysInMonth = _daysInMonth(date),
            weeksInMonth = plugin.settings.weeksInMonth || _weeksInMonth(date, daysInMonth, daysBefore);

         if (((daysInMonth + daysBefore) / 7 ) - weeksInMonth === 0)
             weeksInMonth++;
         
         // Empty the table body, we start all over...
         $tbody.empty();
         // Change the header to match the current month
         $header.html( plugin.settings.months[month] + " " + year.toString() );
      
         for (    var   weekIndex = 0,
                  daysInMonthCount = 1,
                  daysAfterCount = 1; weekIndex < weeksInMonth; weekIndex++ ) {
                     
            var daysInWeekCount = 0,
               row = $("<tr/>").appendTo($tbody);
            
            // Previous month
            while ( daysBefore > 0 ) {
               addCell(row, new Date(year, month, 1 - daysBefore), true);
               daysBefore--;
               daysInWeekCount++;
            }
            
            // Current month
            while ( daysInWeekCount < 7 && daysInMonthCount <= daysInMonth ) {
               addCell(row, new Date(year, month, daysInMonthCount), false, daysInMonthCount === date.getDate() );
               daysInWeekCount++;
               daysInMonthCount++;
            }
            
            // Next month
            while ( daysInMonthCount > daysInMonth && daysInWeekCount < 7 ) {
               addCell(row, new Date(year, month, daysInMonth + daysAfterCount), true);
               daysInWeekCount++;
               daysAfterCount++;
            }
         }
         
         $element.trigger('create');
      }

      $element.bind('change', function(event, begin) {
         var end = new Date(begin.getFullYear(), begin.getMonth(), begin.getDate() + 1, 0,0,0,0);
         // Empty the list
         $listview.empty();
         var clickYear = begin.getFullYear();
         var clickMonth = begin.getMonth();
         var clickDate = begin.getDate();
         var clickFullDate = clickDate + " " + clickMonth + ", " + clickYear;
         $("<li>").attr({'data-role' : 'list-divider'}).append(end).appendTo($listview);
         var clickLi = $("<li>").append($('<a>').attr({'href' : '#', 'date' : clickFullDate }).append($('<p>').append("등록된 스케쥴이 없습니다. 등록하세요."))).appendTo($listview);

         //li event 등록
         $listview.on('click', 'li', function(e) {
            e.preventDefault();
            var date = $(this).find('a').attr('date');
            console.log("click date : " + date);

            $.mobile.changePage('mCalendarInputForm.html', {
               data: {
                  'date': date
               }
            });


         });


         // Find events for this date
         //여기서 이벤트와 바인딩한다.. 여기서 모양을 다르게??
         for ( var   i = 0, event; event = plugin.settings.events[i]; i++ ) {
            if ( event[plugin.settings.end] > begin && event[plugin.settings.begin] < end ) {
               // Append matches to list
               $listview.empty();
               var summary    = event[plugin.settings.summary],
                   beginTime  = (( event[plugin.settings.begin] > begin ) ? event[plugin.settings.begin] : begin ).toTimeString().substr(0,5),
                   endTime    = (( event[plugin.settings.end] < end ) ? event[plugin.settings.end] : end ).toTimeString().substr(0,5),
                   timeString = beginTime + "-" + endTime;
               //$("<li>" + ( ( timeString != "00:00-00:00" ) ? timeString : "" ) + " " + summary + "</li>").appendTo($listview);
               $("<li>").attr({'data-role' : 'list-divider'}).append(end).appendTo($listview);
               $("<li>").append($('<a>').attr({'href' : '#'}).append($('<h3>').append(summary))).appendTo($listview);
               //function..
/*               $listview.on("click", function(event){
                  event.preventDefault();
                  console.log("listClicked.." + $(this).html())

                  $.mobile.changePage('#chatPage', { transition: "flip", changeHash: false });

               })*/
            }else{
               //신규 추가


            }
         }

         $listview.trigger('create').filter(".ui-listview").listview('refresh');
      });
      
      $element.bind('refresh', function(event, date) {
         refresh(date);
      });

      //Edit 버튼 클릭 이벤트와 바인딩 한다.
      $element.bind('edit', function (event, date) {
         console.log("edit binding");
         var $this = $(this),
             date = $this.data('date');

         //calendarEdit를 트리거 한다.
         $element.trigger('calendarEdit', date);



      });
      $element.bind('calendarEdit', function(date){
         $listview.empty();
         //
         var select = $("<select>").attr({'name' : 'select-custom-1', 'id' : 'select-custom-1', 'data-native-menu':'false'});

         var option = $('<option>').attr({'value':'1'}).append("Day1").appendTo(select);
         var option1 = $('<option>').attr({'value':'2'}).append("Day2").appendTo(select);
         var option2 = $('<option>').attr({'value':'3'}).append("Day3").appendTo(select);
         var option3 = $('<option>').attr({'value':'4'}).append("Day4").appendTo(select);
         var option4 = $('<option>').attr({'value':'5'}).append("Day5").appendTo(select);

         console.log("date : " + date);
         $("<li>").attr({'data-role' : 'list-divider'}).append("수정모드").appendTo($listview);
         select.appendTo($listview);
         $listview.trigger('create').filter(".ui-listview").listview('refresh');
      });

      //Save 버튼 클릭 이벤트와 바인딩 한다.
      $element.bind('save', function (e) {

         console.log("save binding");

         var date = new Date();
         var d = date.getDate();
         var m = date.getMonth();
         var y = date.getFullYear();

         var newEvent = {
            events: [{
               "summary": "TEST11",
               "begin": new Date(y,m, 23 ),
               "end": new Date(y, m, 24)

            }, {
               "summary": "CXVXCV",
               "begin": new Date(y, m, d + 3),
               "end": new Date(y, m, d + 4)

            }, {
               "summary": "DSDFSDF",
               "begin": new Date(y, m, d + 6),
               "end": new Date(y, m, d + 7)

            },
            ],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            days: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            startOfWeek: 0

         }

         init2(newEvent);
         //plugin.settings = $.extend({}, plugin.settings, newEvent);       //병합 한다..

         //Save를 하면 event를 수정해야한다..
         //$element.trigger('calendarEdit', date);
      });



      init();
   }

   $.fn.jqmCalendar = function(options) {
      return this.each(function() {
         if (!$(this).data('jqmCalendar')) {
             $(this).data('jqmCalendar', new $.jqmCalendar(this, options));
         }
      });
   }

})(jQuery);