function bookMarksMenu (options) {
	console.log ("bookMarksMenu");
	
	const me = this;
	const defaultOptions = {
		opmltext: undefined,
		saveBookmarks: function () {
			},
		idList: "idBookmarksList",
		maxMenuItemChars: 30,
		flAddBookmarkCommand: true,
		flCanInsertStyles: true, //12/8/23 by DW
		whereToAppend: $("body"), //1/12/24 by DW 
		editBookmarksText: "Edit bookmarks...", //1/13/24 by DW
		getBookmarkTitle: function () {
			return (document.title);
			},
		handleMenuChoice: function (item) { //1/13/24 by DW
			console.log ("handleMenuChoice, atts == " + jsonStringify (item));
			if (item.url === undefined) {
				alertDialog ("Can't open the bookmark because there is no \"url\" attribute.");
				}
			else {
				window.open (item.url);
				}
			},
		isItemChecked: function (item) { //1/13/24 by DW
			return (false);
			}
		};
	for (var x in defaultOptions) {
		if (options [x] === undefined) {
			options [x] = defaultOptions [x];
			}
		}
	
	const nowstring = getNowstring ();
	const check = "<i class=\"fa fa-check iMenuCheck\"></i>";
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
	function isItemChecked (item) {
		return (options.isItemChecked (item));
		}
	
	function buildMenu () {
		const theList = $("#" + options.idList);
		theList.empty ();
		
		function addDivider (theList) {
			theList.append ($("<li class=\"divider\"></li>"));
			}
		function addBookmarkLevel (listInOutline, listInDom) {
			if (listInOutline !== undefined) { //1/12/24 by DW
				listInOutline.forEach (function (item) {
					var itemtext = trimWhitespace (item.text);
					itemtext = maxStringLength (itemtext, options.maxMenuItemChars, false, true);
					if (item.subs === undefined) {
						if (itemtext == "-") {
							addDivider (listInDom);
							}
						else {
							const myCheck = (isItemChecked (item)) ? check : "";
							const menuItem = $("<li><a href=\"#\">" + myCheck + itemtext + "</a></li>");
							listInDom.append (menuItem);
							menuItem.click (function () {
								options.handleMenuChoice (item);
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
		const editBookmarksCommand = $("<li><a href=\"#\">" + options.editBookmarksText + "</a></li>");
		editBookmarksCommand.click (function () {
			editBookmarks (undefined);
			});
		theList.append (editBookmarksCommand);
		}
	function editBookmarks (afterOpenCallback) {
		const styles = (getBoolean (options.flCanInsertStyles)) ? ".divOutlineDialog {width: 400px; left: 50%;}\n" : "";
		appPrefs.outlineFontSize = 14;
		appPrefs.outlineLineHeight = 20;
		
		appPrefs.outlineFontSize = 16; //9/30/23 by DW
		appPrefs.outlineLineHeight = 26;
		
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
		
		var flRestoreConcordHandleEvents = false; //9/30/23 by DW
		if (!concord.handleEvents) {
			concord.handleEvents = true;
			flRestoreConcordHandleEvents = true;
			}
		
		const outlineDialogOptions = {
			title: "Bookmarks",
			flReadOnly: false,
			whereToAppend: options.whereToAppend, //1/12/24 by DW
			divDialogStyles: "divBookmarksDialog",
			opmltext,
			afterOpenCallback: afterOpen
			};
		outlineDialog (outlineDialogOptions, function (flSave, opmltext) {
			flEnableBackgroundTasks = true;
			if (flRestoreConcordHandleEvents) { //9/30/23 by DW
				flRestoreConcordHandleEvents = false;
				}
			if (flSave) {
				options.opmltext = opmltext;
				saveBookmarks ();
				theMenuOutline = opml.parse (opmltext);
				buildMenu ();
				}
			});
		}
	function saveBookmarks () {
		options.saveBookmarks (options.opmltext);
		}
	function updateMenuOutline (theNewMenuOutline) { //1/13/24 by DW -- a caller outside can add something to the menu
		theMenuOutline = theNewMenuOutline;
		options.opmltext = opml.stringify (theMenuOutline);
		buildMenu ();
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
	this.updateMenuOutline = updateMenuOutline; //1/13/24 by DW
	this.buildMenu = buildMenu; //1/13/24 by DW
	}
