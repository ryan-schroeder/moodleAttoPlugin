YUI.add('moodle-atto_ilosbutton-button', function (Y, NAME) {

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/*
 * @package    atto_ilosbutton
 * @copyright  Ilos 2017 With contributions from Joseph Malmsten (joseph.malmsten@gmail.com)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_ilosbutton-button
 */

/**
 * Atto text editor ilosbutton plugin.
 *
 * @namespace M.atto_ilosbutton
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */

var orgApiKey = 'mbWjIVx83qaBLFMv8x8oIzilRqkGjJBwPy73yn50'; //You can find your API key in
var serverPath = 'https://cloud.ilosvideos.com/lti/embed';
var pageUrl = window.location.protocol + "//" + window.location.host;
var iframeId = 'moodleLtiIframe';

var COMPONENTNAME = 'atto_ilosbutton',
    SELECTALIGN = 'float:left; display:none',
    TEMPLATE = '<iframe src="{{src}}" id="{{id}}" height="{{height}}" width="{{width}}" scrolling="auto"></iframe>';

    Y.namespace('M.atto_ilosbutton').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
        /**
         * Initialize the button
         *
         * @method Initializer
         */

        initializer: function () {
            // If we don't have the capability to view then give up.
            if (this.get('disabled')) {
                return;
            }

            var icon = 'iconone';

            // Add the ilosbutton icon/buttons.
            this.addButton({
                icon: 'ed/' + icon,
                iconComponent: 'atto_ilosbutton',
                buttonName: icon,
                callback: this._displayDialogue,
                callbackArgs: icon
            });
        },

        /**
         * Display the ilosbutton Dialogue
         *
         * @method _displayDialogue
         * @private
         */
        _displayDialogue: function (e, clickedicon) {
            var width = 900,
                height = 700,
                dialogue = this.getDialogue({
                    headerContent: M.util.get_string('dialogtitle', COMPONENTNAME),
                    width: width + 'px',
                    height: height + 'px',
                    focusAfterHide: clickedicon
                });

            e.preventDefault();

            // When dialog becomes invisible, reset it. This fixes problems with multiple editors per page.
            dialogue.after('visibleChange', function() {
                var attributes = dialogue.getAttrs();

                if(attributes.visible === false) {
                    setTimeout(function() {
                        dialogue.reset();
                    }, 5);
                }
            });

            // Dialog doesn't detect changes in width without this.
            // If you reuse the dialog, this seems necessary.
            if (dialogue.width !== width + 'px') {
                dialogue.set('width', width + 'px');
            }

            if (dialogue.height !== height + 'px') {
                dialogue.set('height', height + 'px');
            }

            dialogue.set('bodyContent', this._getFormContent(clickedicon));

            dialogue.show();

            this._doInsert(this);
        },

        /**
         * Return the dialogue content for the tool, attaching any required
         * events.
         *
         * @method _getDialogueContent
         * @return {Node} The content to place in the dialogue.
         * @private
         */
        _getFormContent: function (clickedicon) {

            var returnUrl = pageUrl+'/mod/lti/return.php?course='+this.get('coursecontext');

            var launchUrl = serverPath+'?oauth_consumer_key='+orgApiKey+'&launch_presentation_return_url='+encodeURI(returnUrl)
                +"&tool_consumer_info_product_family_code=moodle";

            var template = Y.Handlebars.compile(TEMPLATE),
                content = Y.Node.create(template({
                    elementid: this.get('host').get('elementid'),
                    component: COMPONENTNAME,
                    clickedicon: clickedicon,
                    src: launchUrl,
                    height: 650,
                    width: 850,
                    id: iframeId,
                    selectalign: SELECTALIGN
                }));

            this._form = content;
            return content;
        },

        /**
         * Inserts the users input onto the page
         * @method _getDialogueContent
         * @private
         */
        _doInsert: function (parent) {

            var $iframeEl = document.getElementById( iframeId );

            $iframeEl.onload= function() {

                var $innerIframe = $iframeEl.contentDocument;

                if(!$innerIframe)
                {
                    return;
                }

                var $innerElement = $innerIframe.getElementById("page-content").querySelector('[role="main"]');
                var $url = $innerElement.innerText;
                var $search = $url.search("https://");
                $url = $url.substr($search);

                if ($url.indexOf("ilosvideos") >= 0)
                {

                    var $iframe = '<iframe allowfullscreen="" frameborder="0" height="315"'
                        + ' src="'+$url+'" width="560"></iframe>';
                    console.log($iframe);

                    parent.getDialogue({ focusAfterHide: null }).hide();
                    parent.editor.focus();
                    parent.get('host').insertContentAtFocusPoint($iframe);
                    parent.markUpdated();
                }
            };

            /*
*/
/*            var win,
                message,
                eventmethod,
                evententer,
                messageevent,
                parent = this,
                eventfired = false;

            e.preventDefault();

            win = document.getElementById('pageframe').contentWindow,
            message = {
                cmd: 'createEmbeddedFrame'
            };
            win.postMessage(JSON.stringify(message), 'https://' + servername);

            eventmethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
            evententer = window[eventmethod];
            messageevent = eventmethod === 'attachEvent' ? 'onmessage' : 'message';

            // Event triggered when response is received from server with object ids.
            evententer(messageevent, function (e) {
                var message,
                    objectstring,
                    thumbnailChunk,
                    ids,
                    names,
                    i;
                if (!eventfired) {
                    message = JSON.parse(e.data);
                    objectstring = '';

                    // Called when "Insert" is clicked. Creates HTML for embedding each selected video into the editor.
                    if (message.cmd === 'deliveryList') {
                        ids = message.ids;
                        names = message.names;

                        for (i = 0; i < ids.length; ++i) {
                            thumbnailChunk = "<div style='position: absolute; z-index: -1;'>";

                            if (typeof names[i] !== 'undefined') {
                                thumbnailChunk += "<div width='450'><a style='max-width: 450px; display: inline-block;" +
                                    "text-overflow: ellipsis; white-space: nowrap; overflow: hidden;'" +
                                    "href='https://" + servername + '/Ilos/Pages/Viewer.aspx?id=' + ids[i] +
                                    "' target='_blank'>" + names[i] + "</a></div>";
                            }

                            thumbnailChunk += "<a href='https://" + servername + '/Ilos/Pages/Viewer.aspx?id=' +
                                ids[i] + "' target='_blank'>" +
                                "<img width='128' height='72' src='https://" + servername + '/Ilos/PublicAPI/SessionPreviewImage?id=' +
                                ids[i] + "'></img></a><br></div>";

                            objectstring += "<div style='position: relative;'>" +
                                thumbnailChunk +
                                "<div>" + "<object data='https://" + servername + '/Ilos/Pages/Embed.aspx?id=' +
                                ids[i] +
                                "&v=1' width='450' height='300' frameborder='0'></object><br></div>" +
                                "</div>";
                        }

                        // Hide the pop-up after we've received the selection in the "deliveryList" message.
                        // Hiding before message is received causes exceptions in IE.
                        parent.getDialogue({ focusAfterHide: null }).hide();

                        parent.editor.focus();
                        parent.get('host').insertContentAtFocusPoint(objectstring);
                        parent.markUpdated();
                    }

                    // This plug-in instance has completed the job, but it's still alive until editor is closed.
                    // If another plug-in instance is created, the event is posted also this instance.
                    // We need to ignore such events.
                    eventfired = true;
                }
            }, false);*/
        }
    }, {
        ATTRS: {
            disabled: {
                value: false
            },

            usercontextid: {
                value: null
            },

            defaultserver: {
                value: ''
            },
            coursecontext: {
                value: null
            },
            servename: {
                value: null
            }
        }
    });


}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin"]});
