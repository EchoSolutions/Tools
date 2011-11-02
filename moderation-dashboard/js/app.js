var MOD = function () {

    var site, blogUrl, scope, before, after, state, $tabs, userSessionId, moderated;


    var tab_counter = 4;

    if (document.domain.indexOf('dev.') > 0) {
        var APPKEY = NYMCONFIG.appKey.dev;
        var GRUBSTREETURL = NYMCONFIG.environments.grubstreet.dev;
        var NYMAGURL = NYMCONFIG.environments.nymag.dev;
    } else if (document.domain.indexOf('stg.') > 0) {
        var APPKEY = NYMCONFIG.appKey.stg;
        var GRUBSTREETURL = NYMCONFIG.environments.grubstreet.stg;
        var NYMAGURL = NYMCONFIG.environments.nymag.stg;
    } else if (document.domain.indexOf('qa.') > 0) {
        var APPKEY = NYMCONFIG.appKey.qa;
        var GRUBSTREETURL = NYMCONFIG.environments.grubstreet.qa;
        var NYMAGURL = NYMCONFIG.environments.nymag.qa;
    } else {
        var APPKEY = NYMCONFIG.appKey.prod;
        var GRUBSTREETURL = NYMCONFIG.environments.grubstreet.prod;
        var NYMAGURL = NYMCONFIG.environments.nymag.prod;
    }

    return {

        setControls: function () {

            $("input:submit,input:reset,#refresh").button();
            $('#refresh').click(function () {
                MOD.queryEcho();
            });


            $('input[name="source"],input[name="sortOrder"],input[name="flags"],input[name="markers"],input[name="threading"],input[name="moderated"],input[name="deleted"],input[name="banned"]').change(function () {
                MOD.queryEcho();
            });

            $('#commentTabsTabs a').click(function () {
                setTimeout(function () {
                    MOD.queryEcho();
                }, 200);
            });


            $('#userSearchSubmit').click(function () {
                MOD.userSearch();
            });

            $('#userSearchInput').keypress(function (event) {
                if (event.which == '13') {
                    $('#userSearchSubmit').click();
                }
            });

            $('#showHideQuery').toggle(function () {
                $('#displayQuery').slideDown();
                $(this).html('Hide Query [-]')
            }, function () {
                $('#displayQuery').slideUp();
                $(this).html('Show Query [+]')
            });

            $('#userIdReset').click(function () {
                userId = '';
                MOD.setUser(userId);
                $("#userId").val(userId);
                $('#userInfo').hide();
                MOD.queryEcho();
            });

			$("#userState,#userRole").buttonset();

	    $("#userState_nymProbation").click(function() {
		$("#userProbation").dialog({
			"title": "Probation Time Period"
		});

		$("#probationSubmit").bind("click.pb",function() {
			var timeframe;
			var expire = new Date();
			var td = new Date();
			$("#userProbation").dialog("close");
            		$("#userProbation").find("input[type=radio]").each(function () {
                		t = $(this);
		                if (t.is(':checked')) {
            	   		     timeframe = t.val();
               		 	}
            		});
			if (timeframe == "7days") {
				 expire.setDate(td.getDate()+7);
			} else if (timeframe == "30days") { 
				expire.setDate(td.getDate()+30);
			} else {
				expire.setFullYear(2020,0,1);
			}
			var ty = expire.getFullYear();
			var tm = expire.getMonth();
			var tm = parseFloat(tm) + 1;
			var tdd = expire.getDate();
			expire = (ty+"-"+tm+"-"+tdd);
			$("#probExp, #probExpDate").show();
			$("#probExpDate").html(expire);
			$("#probationSubmit").unbind("click.pb");
		});
	    });
            $('#userUpdate').click(function () {
                MOD.updateUser();
            });

        },
        // end datePicker()
        datePicker: function () {

            var dates = $("#from, #to").datepicker({
                defaultDate: "+1d",
                maxDate: "+1d",
                dateFormat: "yy-mm-dd",
                numberOfMonths: 1,
                onSelect: function (selectedDate) {
                    var option = this.id == "from" ? "minDate" : "maxDate",
                        instance = $(this).data("datepicker");
                    date = $.datepicker.parseDate(
                    instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
                    dates.not(this).datepicker("option", option, date);

                }
            });

            $('#filterByDate').click(function () {
                query = $('body').data('query');
                var afterDate = $('#from').val();
                var beforeDate = $('#to').val();
                query.before = beforeDate;
                query.after = afterDate;
                MOD.queryEcho();
            })
            
            $('#resetByDate').click(function () {
                query = $('body').data('query');
                var afterDate = '';
                var beforeDate = '';
                query.before = beforeDate;
                query.after = afterDate;
                $("#from").val('');
                $("#to").val('');
                MOD.queryEcho();
            });
        },
        // end datePicker()
        loadEcho: function () {

            $.getScript('http://cdn.echoenabled.com/clientapps/v2/jquery-plugins.js', function () {
                $.getScript('http://cdn.echoenabled.com/clientapps/v2/backplane.js', function () {
                    Backplane.init({
                        "serverBaseURL": "http://api.js-kit.com/v1",
                        "busName": "jskit"
                    });
                    $.getScript('http://cdn.echoenabled.com/clientapps/v2/auth.js', function () {
                        new Echo.Auth({
                            "target": document.getElementById("echo-login-form"),
                            "appkey": APPKEY,
                            "identityManager": {
                                "login": {
                                    "width": 400,
                                    "height": 240,
                                    "url": "https://echo.rpxnow.com/openid/embed?flags=stay_in_window,no_immediate&token_url=http%3A%2F%2Fjs-kit.com%2Fapps%2Fjanrain%2Fwaiting.html&bp_channel="
                                },
                                "edit": {
                                    "width": 400,
                                    "height": 240,
                                    "url": "https://echo.rpxnow.com/openid/embed?flags=stay_in_window,no_immediate&token_url=http%3A%2F%2Fjs-kit.com%2Fapps%2Fjanrain%2Fwaiting.html&bp_channel="
                                },
                                "signup": {
                                    "width": 400,
                                    "height": 240,
                                    "url": "https://echo.rpxnow.com/openid/embed?flags=stay_in_window,no_immediate&token_url=http%3A%2F%2Fjs-kit.com%2Fapps%2Fjanrain%2Fwaiting.html&bp_channel="
                                }
                            }
                        });
                    });
                });
                $.getScript('http://cdn.echoenabled.com/clientapps/v2/stream.js', function () {
                    $.getScript('http://cdn.echoenabled.com/clientapps/v2/plugins/whirlpools.js');
                    $.getScript('http://cdn.echoenabled.com/clientapps/v2/plugins/curation.js', function () {
                        $.getScript('http://cdn.echoenabled.com/clientapps/v2/plugins/edit.js', function () {
                            $.getScript('js/plugins.js', function () {
                                MOD.queryEcho();
                            });
                        });
                    });
                });
            });

        },
        // end loadEcho()
        queryEcho: function () {

            this.setScope();
            this.setOrder();
            this.setBanned();
            this.setDeleted();
            this.setModerated();
            this.setTabs();
            this.setMarkers();
            this.setThreading();

            before = "";
            after = "";
            state = "";
            markers = "";
            tags = "";
            userId = "";
            showDeleted = "";
            showModerated = "";
            showBanned = "";

            query = $('body').data('query');

            //console.log(query.userId);
            scope = query.scope;
            children = query.children;
            sortOrder = query.sortOrder;
            showDeleted = query.showDeleted;
            showModerated = query.showModerated;
            showBanned = query.showBanned;

            if (!(query.before === "")) {
                before = 'before:' + query.before + '';
            }
            if (!(query.after === "")) {
                after = 'after:' + query.after + '';
            }
            if (!(query.markers === "")) {
                markers = 'markers:' + query.markers + '';
            }
            if (!(query.tags === "")) {
                tags = 'tags:' + query.tags + '';
            }
            if (!(query.state === "")) {
                state = query.state;
            }
            if (!(query.userId === "")) {
                userId = 'user.id:' + query.userId + '';
            }



            queryString = "(" + scope + ") AND (" + userId + ") AND (" + state + ") AND (" + markers + ") AND (" + tags + ") AND (" + showModerated + ") type:comment source:nymag.com " + showDeleted + " " + showBanned + " " + before + " " + after + " children:" + children + " sortOrder:" + sortOrder + " itemsPerPage:100";

            $('#displayQuery span').html(queryString);
            $('#queryWhat').html('');

            new Echo.Stream({
                "target": document.getElementById("echo-stream"),
                "appkey": APPKEY,
                "query": queryString,
                "plugins": [{
                    "name": "Curation"
                }, {
                    "name": "Edit"
                }, {
                    "name": "Whirlpools",
                    "after": 1,
                    "clickable": true
                }, {
                    "name": "moderatorMarkerClass"
                }]
            });

            Echo.Broadcast.subscribe("Stream.onReady", function () {
                //queryCount = "scope:"+scope+"&"+before+"&"+after+"&"+state+"&"+markers;
                //queryCount = encodeURIComponent(queryCount);
                //console.log(queryCount);
                //$.getJSON('http://api.echoenabled.com/v1/count?callback=?&q='+queryCount+'&appkey='+MOD.config.appKey, function(data) { 
                //	console.log(data.count);
                //});

            });

        },
        // end queryEcho()
        setScope: function () {
            var scopeUrl, customScope;

            $("#tabs-blogSearch").find("input[type=radio]").each(function () {
                t = $(this);
                if (t.is(':checked')) {
                    website = t.data('website');
                    subdomain = t.data('subdomain');
                    customScope = t.data('customScope');
                    urlScope = t.val();
                    label = t.parent('label').text();
                    //standard scope
                    if (typeof customScope == 'undefined') {
                        if (website === "grubstreet") {
                            scopeUrl = "(scope:http://" + subdomain + "." + GRUBSTREETURL + urlScope + ")";

                        } else if (website === "nymag") {
                            scopeUrl = "(scope:http://" + NYMAGURL + urlScope + ")";

                        }
                        //start custom scopes
                    } else if (customScope == 'grubstreet.com') {
                        scopeUrl = "(scope:http://boston." + GRUBSTREETURL + "/*) OR " + "(scope:http://chicago." + GRUBSTREETURL + "/*) OR " + "(scope:http://losangeles." + GRUBSTREETURL + "/*) OR " + "(scope:http://newyork." + GRUBSTREETURL + "/*) OR " + "(scope:http://philadelphia." + GRUBSTREETURL + "/*) OR " + "(scope:http://sanfrancisco." + GRUBSTREETURL + "/*)";

                    } else if (customScope == 'nymag-all-blogs') {
                        scopeUrl = "(scope:http://newyork." + GRUBSTREETURL + "/*) OR " + "(scope:http://" + NYMAGURL + "/daily/*)";

                    } else if (customScope == 'nymag-sans-blogs') {
                        scopeUrl = "(scope:http://" + NYMAGURL + "/*) AND " + "(-scope:http://" + NYMAGURL + "/daily/*)";
                    }
                }
            });
            $('#queryScope').html(label);
            query = $('body').data('query');
            query.scope = scopeUrl;

        },
        // end setScope()    	
        setBanned: function () {

            $("#banned").find("input[type=radio]").each(function () {
                t = $(this);
                if (t.is(':checked')) {
                    banned = t.val();
                }
            });

            query = $('body').data('query');
            query.showBanned = banned;

        },
        // end setDeleted()	
        setDeleted: function () {

            $("#deleted").find("input[type=radio]").each(function () {
                t = $(this);
                if (t.is(':checked')) {
                    deleted = t.val();
                }
            });

            query = $('body').data('query');
            query.showDeleted = deleted;

        },
        // end setDeleted()
        setModerated: function () {

            $("#moderated").find("input[type=radio]").each(function () {
                t = $(this);
                if (t.is(':checked')) {
                    moderated = t.val();
                }
            });

            query = $('body').data('query');
            query.showModerated = moderated;

        },
        // end setDeleted()	    
        setOrder: function () {

            $("#sortOrder").find("input[type=radio]").each(function () {
                t = $(this);
                if (t.is(':checked')) {
                    sortOrder = t.val();
                }
            });

            query = $('body').data('query');
            query.sortOrder = sortOrder;

        },
        // end setOrder()
        setMarkers: function () {
            var markers = [];
            $("#markers").find("input[type=checkbox]").each(function () {
                m = $(this);
                if (m.is(':checked')) {
                    v = m.val();
                    markers.push(v);
                }
            });
            markers = markers.toString();
            query = $('body').data('query');
            query.markers = markers;

        },
        // end setMarkers()
        setTabs: function () {

				/*var flags = [];
				$("#flags").find("input[type=checkbox]").each(function() {
					m = $(this);
	                if(m.is(':checked')){
	                	v = m.val();
						flags.push(v);
	                }
	            });
	            
	            flags = flags.toString();*/

            var tabs = $('#commentTabs li.ui-tabs-selected').data('query');

            query = $('body').data('query');


            tabUserId = tabs.userId;
            query.userId = tabUserId;
            
            if (!(tabs.userId == '')) {
				$('#userInfo').show();    
            } else {
				$('#userInfo').hide();
            }

            tabTags = tabs.tags;
            query.tags = tabTags;

            if (!(typeof tabs.state == 'undefined')) {
                state = tabs.state;
                query.state = state;
            }


        },
        // end setTabs()      
        setThreading: function () {


            $("#threading").find("input[type=radio]").each(function () {
                t = $(this);
                if (t.is(':checked')) {
                    children = t.val();
                }
            });

            query = $('body').data('query');
            query.children = children;

        },
        // end setThreading()	
        setUser: function (userId) {

            if (typeof userId == 'undefined') {
                var userId = $("#userId").val();
            }

            query = $('body').data('query');
            query.userId = userId;

        },
        // end setUser()	  
        updateUser: function (userId) {

			var update = false;
            if (typeof userId == 'undefined') {
                query = $('body').data('query');
                userId = query.userId;
            }
            
			$("#userState").find("input[type=radio]").each(function () {
                t = $(this);
                if (t.is(':checked')) {
                    userState = t.val();
                }
            });
            
			$("#userRole").find("input[type=radio]").each(function () {
                t = $(this);
                if (t.is(':checked')) {
                    userRole = t.val();
                }
            });
            
            //var userState = $('#userStateSelect').val();
            //var userRoles = $('#userRolesSelect').val();
            //var userMarkers = $('#userMarkersSelect').val();

			//console.log(userState);
			//console.log(userRole);

            var postUrl = '/api/users/update.json';

            if (userState !="null" && userState !="nymProbation") {
                $.post(postUrl, {
                    "identityUrl": userId,
                    "subject": "state",
                    "content": userState
                }, function (data) {
                    console.log(data);
		    var markers = data.value.echo.markers;
	            if ($.inArray("nymProbation",markers) != -1) {
			markers = jQuery.grep(markers, function(value) {
		        return value != "nymProbation";
			});
			markers = markers.toString();
			markers = "";
	                $.post(postUrl, {
       		             "identityUrl": userId,
               		     "subject": "markers",
	                    "content": markers
        	        }, function (data) {
               		     //console.log(data);
                	});
		    }
                    update = true;
                });
            } else if (userState !="null" && userState =="nymProbation") {
		var expDate = $("#probExpDate").html();
                $.post(postUrl, {
                    "identityUrl": userId,
                    "subject": "markers",
                    "content": "nymProbation",
		    "bannedUntil": expDate
                }, function (data) {
                    console.log(data);
                    update = true;
                });
	    }
           if (!(userRole == "null")) {
                $.post(postUrl, {
                    "identityUrl": userId,
                    "subject": "roles",
                    "content": userRole
                }, function (data) {
                    console.log(data);
                    update = true;
                });
            }

            /*if (!(userMarkers == "null")) {

                $.post(postUrl, {
                    "identityUrl": userId,
                    "subject": "markers",
                    "content": userMarkers
                }, function (data) {
                    //console.log(data);
                });
            }*/
            
            	$('#userInfoMessage span').html('User status has been updated. Please wait for up to 15 minutes for your changes to go live.');
	            $('#userInfoMessage').show('fast', function () {
					setTimeout(function () {
                        $('#userInfoMessage').hide('fast');
                   	 	  $('#userInfoMessage span').html();
                   	}, 2000);
	            });
			
        },
        // end updateUser()
        userSearch: function (user) {
            var userList = new Array();

            $('#userSearchMessage').slideUp('fast', function () {
                $('#userSearchMessage span').fadeOut().html('');
            });

            //let's check and see if it's a NYM ID URL
            var inputTxt = $('#userSearchInput').val();
            var nymRegx = new RegExp('http:\/\/my.' + NYMAGURL + '\/');
            var urlRegx = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
            if (inputTxt.length < 3) {

                $('#userSearchMessage span').html('Three (3) or more characters are required to search');
                $('#userSearchMessage').slideDown('fast', function () {
                    setTimeout(function () {
                        $('#userSearchMessage').slideUp('fast');
                    }, 2000);
                });
            } else {

                if (urlRegx.test(inputTxt)) {

                    $tabs.tabs("option", "tabTemplate", '<li data-query=\'{"state":"","userId":"' + inputTxt + '","tags":""}\'><a href=\"#{href}\">#{label}</a><img src=\"img/close.png\" alt=\"close\" class=\"close-tab\"></div>').tabs("add", "#tabs-" + tab_counter, inputTxt).tabs("select", "#tabs-" + tab_counter).find('#commentTabsTabs a').click(function () {
                        setTimeout(function () {
                            MOD.queryEcho();
                        }, 50);
                    });
                    tab_counter++;
                    MOD.setUser(inputTxt);
                    MOD.queryEcho();
/*var user  = new Echo.User({"appkey":APPKEY});
							user.init(function() {
			    				if(!(user.isAdmin())){
			    					alert("Please login with your Adminstrator credentials to view/update Users");
			    				}else{
									MOD.queryEcho();
								}
							});	
							*/
                } else {
                    $.getJSON('/api/users/search.json?handle='+inputTxt, function(data) {
                   	//$.getJSON('js/test.json', function (data) {
                        $('#userSearchResults tbody').html('');
                        var totalResults = data.totalResults;

                        if (totalResults < 1) {

                            $('#userSearchMessage span').html('Your search did not return any results.');
                            $('#userSearchMessage').slideDown('fast', function () {
                                setTimeout(function () {
                                    $('#userSearchMessage').slideUp('fast');
                                }, 2000);
                            });
                        } else {

                            if (totalResults === 1) {
                                $('#totalResults').html(totalResults + ' User');
                            } else {
                                $('#totalResults').html(totalResults + ' Users');
                            }

                            $.each(data.pocos, function (index, value) {

                                var accounts = value.entry.accounts[0];

				var probation = "";
				if (value.nym) {
					probation = value.nym.bannedUntil;
				}
                                var userSrch_idurl = "";
                                var userSrch_uname = "";
                                var userSrch_dname = "";
                                var userSrch_email = [];


                                if (!(typeof accounts.identityUrl == 'undefined')) {
                                    userSrch_idUrl = accounts.identityUrl;
                                }
                                if (!(typeof accounts.username == 'undefined')) {
                                    userSrch_uname = accounts.username;
                                }
                                if (!(typeof accounts.displayName == 'undefined')) {
                                    userSrch_dname = accounts.displayName;
                                }
                                if (!(typeof accounts.emails == 'undefined')) {
                                    $.each(accounts.emails, function (index, value) {
                                        userSrch_email.push('<a href="mailto:' + value.value + '">' + value.value + '</a>');
                                    });
                                }


                                $('#userSearchResults tbody').append('<tr data-username="' + userSrch_uname + '"><td class="user"><a href="' + accounts.identityUrl + '">' + userSrch_uname + '</a></td><td class="name">' + userSrch_dname + '</td><td class="email">' + userSrch_email + '</td><td class="state"></td><td class="roles"></td><td class="markers"></td><td class="probation">'+probation+'</td>');
                                userList.push(userSrch_uname);
                            });

                            MOD.userProps(userList, 0);

                            $('#userSearchResults').slideDown('fast', function () {
                                $("#close-searchResults").fadeIn().click(function () {
                                    $(this).fadeOut();
                                    $('#userSearchResults').slideUp('fast');
                                });
                            });

                            $("#userSearchResults tbody tr:odd").addClass("odd");
                            $("#userSearchResults tbody tr").hover(function () {
                                $(this).addClass('hover');
                            }, function () {
                                $(this).removeClass('hover');
                            });

                            $("#userSearchResults .user a").click(function () {
                                inputTxt = $(this).attr('href');
                                $tabs.tabs("option", "tabTemplate", '<li data-query=\'{"state":"","userId":"' + inputTxt + '","tags":""}\'><a href=\"#{href}\">#{label}</a><img src=\"img/close.png\" alt\"close\" class=\"close-tab\"></div>').tabs("add", "#tabs-" + tab_counter, inputTxt).tabs("select", "#tabs-" + tab_counter).find('#commentTabsTabs a').click(function () {
                                    setTimeout(function () {
                                        MOD.queryEcho();
                                    }, 50);
                                });

                                tab_counter++;
                                MOD.setUser(inputTxt);
				MOD.userStatus(inputTxt);
                                MOD.queryEcho();
                                $('#userInfo').show();
                                return false;
                            });
                        }
                    });
                }                
            }
        },
        // end userSearch()
        userProps: function (userList, start) {
            var end = start + 10;
            var userAmt = userList.length;
            if (start > userAmt) {
                return false
            }
            var userQuery = new Array();
            var muxdomain = 'http://api.echoenabled.com/v1/mux';
            var muxappkey = "appkey=" + APPKEY;
            $.each(userList, function (i) {
                if (i >= start && i <= end) {
                    var username = userList[i];
                    var id = '"id":"' + username + '",';
                    var method = '"method":"search",';
                    var appkey = "appkey=" + APPKEY;
                    var queryStr = 'scope:';
                    var queryFilters = " itemsPerPage:1";
                    var commentQuery = id + method + '"q":"' + '((' + queryStr + "http://" + NYMAGURL + '/*) OR (' + queryStr + GRUBSTREETURL + '/*)) AND (user.id:http://my.' + NYMAGURL + "/" + username + ')' + queryFilters + '"';
                    userQuery.push(commentQuery);
                }
            });
            userQuery = userQuery.join('},{');
            var urlQuery = muxdomain + '?' + muxappkey + '&requests=[{' + userQuery + '}]&callback=?';
            urlQuery = encodeURI(urlQuery);
            $.getJSON(urlQuery, function (data) {
                $.each(data, function (i) {
                    if (this.entries.length != 0) {
                        if (this.entries[0].actor.roles != undefined) {
                            var roles = this.entries[0].actor.roles.toString();
                        }
                        if (this.entries[0].actor.status != undefined) {
                            var status = this.entries[0].actor.status.toString();
                        }
                        if (this.entries[0].actor.markers != undefined) {
                            var markers = this.entries[0].actor.markers.toString();
                        }
                        $("[data-username='" + i + "']").find(".roles").html(roles);
                        $("[data-username='" + i + "']").find(".state").html(status);
                        $("[data-username='" + i + "']").find(".markers").html(markers);
                    }
                });
            });
            MOD.userProps(userList, end);
        },
		userStatus: function (userId) {

			var searchQuery = 'http://api.echoenabled.com/v1/search?callback=?&q=((scope:http://' + NYMAGURL + '/*) OR (scope:http://' + GRUBSTREETURL + '/*)) AND (user.id:'+ userId + ') itemsPerPage:1&appkey='+APPKEY;
            searchQuery = encodeURI(searchQuery);
            
            $.getJSON(searchQuery, function (data) {
		console.log(data);
            	var entries = data.entries;
            	if(entries.length > 0){
					$('label[for=userState_nymProbation] #probExp, label[for=userState_nymProbation] #probExpDate').empty();
					var markers = entries[0].actor.markers;
            	
					if (!(typeof entries[0].actor.status == 'undefined')) {
						var status = entries[0].actor.status;
					}else{
						var status = "Untouched";
					}
					if (!(typeof entries[0].actor.roles == 'undefined')) {
						var roles = entries[0].actor.roles[0];
					}else{
						var roles = "Untouched";
					}

					
					if(status == "ModeratorBanned"){
						$('label[for=userState_ModeratorBanned]').click();
						attr = $('#userState_ModeratorBanned').attr();
						console.log(attr);
						//$('#userState_ModeratorBanned').attr('checked','checked');
					}else{
						$('label[for=userState_Untouched]').click();
						attr = $('#userState_Untouched').attr();
						console.log(attr);
						//$('#userState_Untouched').attr('checked','checked');
					}

					if(roles == "moderator" || roles == "administrator"){
						$('label[for=userRole_Moderator]').click();
						attr = $('#userRole_Moderator').attr();
						//console.log(attr);
						//$('#userRole_Moderator').attr('checked','checked');
					} else if ($.inArray("nymProbation",markers) != -1) {
                                                $('label[for=userState_nymProbation]').click();
					} else  {
						$('label[for=userRole_Untouched]').click();
						//console.log(attr);
						//$('#userRole_Untouched').attr('checked','checked');
					}
           	
                	
            	}else{
            		alert("This user has not made any comments");
            	}
			});
            //MOD.userProps(userList, end);
        },
        init: function () {

            //$('#commentTabs').tabs();
            $tabs = $("#commentTabs").tabs({
                //tabTemplate: "<li data-query=\"{'state':'','userId':'{label}'}\"><a href='#{href}'>#{label}</a> <img src=\"img/close.png\" class=\"close-tab\"></li>",
                add: function (event, ui) {
                    //console.log(ui);
                }
            });




            $(".close-tab").live("click", function () {
                var index = $("li", $tabs).index($(this).parent());
                $tabs.tabs("remove", index);
                MOD.queryEcho();
            });

            $('#loader').fadeOut();
            $('#contentWrap').fadeIn()

            this.datePicker();
            this.setControls();
            this.loadEcho();


        } // end init()
    };

}(); // end MOD
