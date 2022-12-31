function bookMarksMenu (options) {
	console.log ("bookMarksMenu");
	
	const me = this;
	const defaultOptions = {
		opmltext: undefined,
		saveBookmarks: function () {
			},
		idList: "idBookmarksList",
		maxMenuItemChars: 20,
		flAddBookmarkCommand: true,
		getBookmarkTitle: function () {
			return (document.title);
			}
		};
	for (var x in defaultOptions) {
		if (options [x] === undefined) {
			options [x] = defaultOptions [x];
			}
		}
	
	const nowstring = getNowstring ();
	const emptyMenu = {
		opml: {
			head: {
				title: "Bookmarks",
				dateCreated: nowstring,
				dateModified: nowstring
				},
			body: {
				subs: [
					{
						text: ""
						}
					]
				}
			}
		};
	var theMenuOutline;
	
	function getNowstring () {
		return (new Date ().toGMTString ());
		}
	function addAndEditNewBookmark (title, atts) {
		editBookmarks (function () {
			opFirstSummit ();
			opInsert (title, up);
			opSetAtts (atts);
			opSetOneAtt ("type", "bookmark");
			opSetOneAtt ("icon", "bookmark");
			opSetOneAtt ("created", getNowstring ());
			});
		}
	function haveBookmarks () { //return true iff there are any bookmarks
		const flHaveBookmarks = theMenuOutline.opml.body.subs.length > 0;
		return (flHaveBookmarks);
		}
	
	function buildMenu () {
		const theList = $("#" + options.idList);
		theList.empty ();
		
		function addDivider (theList) {
			theList.append ($("<li class=\"divider\"></li>"));
			}
		function addBookmarkLevel (listInOutline, listInDom) {
			listInOutline.forEach (function (item) {
				var itemtext = trimWhitespace (item.text);
				itemtext = maxStringLength (itemtext, options.maxMenuItemChars, false, true);
				if (item.subs === undefined) {
					if (itemtext == "-") {
						addDivider (listInDom);
						}
					else {
						const menuItem = $("<li><a href=\"#\">" + itemtext + "</a></li>");
						listInDom.append (menuItem);
						menuItem.click (function () {
							console.log ("Open bookmark, atts == " + jsonStringify (item));
							if (item.url === undefined) {
								alertDialog ("Can't open the bookmark because there is no \"url\" attribute.");
								}
							else {
								window.open (item.url);
								}
							});
						}
					}
				else {
					var liMenuItem = $("<li class=\"dropdown-submenu\"><a href=\"#\">" + itemtext + "</a></li>");
					var ulSubMenu = $("<ul class=\"dropdown-menu\"></ul>");
					listInDom.append (liMenuItem);
					addBookmarkLevel (item.subs, ulSubMenu);
					liMenuItem.append (ulSubMenu);
					}
				});
			}
		
		if (options.flAddBookmarkCommand) {
			const addBookmarkCommand = $("<li><a href=\"#\">Add bookmark...</a></li>");
			addBookmarkCommand.click (function () {
				var title = options.getBookmarkTitle ();
				confirmDialog ("Add \"" + title + "\" to the Bookmarks menu?", function () {
					const atts = {
						url: location.href
						};
					addAndEditNewBookmark (title, atts);
					});
				});
			theList.append (addBookmarkCommand);
			addDivider (theList);
			}
		
		addBookmarkLevel (theMenuOutline.opml.body.subs, theList);
		
		addDivider (theList);
		const editBookmarksCommand = $("<li><a href=\"#\">Edit bookmarks...</a></li>");
		editBookmarksCommand.click (function () {
			editBookmarks (undefined);
			});
		theList.append (editBookmarksCommand);
		}
	function editBookmarks (afterOpenCallback) {
		var styles = ".divOutlineDialog {width: 400px; left: 50%;}\n";
		appPrefs.outlineFontSize = 14;
		appPrefs.outlineLineHeight = 20;
		const opmltext = opmlStringify (theMenuOutline);
		flEnableBackgroundTasks = false;
		
		function afterOpen () {
			if (afterOpenCallback !== undefined) {
				afterOpenCallback ();
				}
			$(opGetActiveOutliner ()).concord ({ //12/31/22 by DW
				callbacks: {
					opExpand: function () {
						var atts = opGetAtts ();
						if (atts.url !== undefined) {
							window.open (atts.url);
							}
						}
					}
				});
			}
		
		outlineDialog ("Bookmarks", opmltext, false, function (flSave, opmltext) {
			flEnableBackgroundTasks = true;
			if (flSave) {
				options.opmltext = opmltext;
				saveBookmarks ();
				theMenuOutline = opml.parse (opmltext);
				buildMenu ();
				}
			}, afterOpen, undefined, undefined, styles);
		}
	function saveBookmarks () {
		options.saveBookmarks (options.opmltext);
		}
	
	this.start = function (callback) {
		if (options.opmltext === undefined) {
			theMenuOutline = emptyMenu;
			options.opmltext = opmlStringify (emptyMenu);
			saveBookmarks ();
			}
		else {
			theMenuOutline = opml.parse (options.opmltext);
			}
		buildMenu ();
		};
	this.addAndEdit = addAndEditNewBookmark;
	this.haveBookmarks = haveBookmarks;
	}
