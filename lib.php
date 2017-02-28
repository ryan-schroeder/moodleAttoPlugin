<?php
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

/**
 * Atto text editor integration version file.
 *
 * @package    atto_ilosbutton
 * @copyright  Ilos 2017
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();


/**
 * Initialize this plugin
 */
function atto_ilosbutton_strings_for_js() {

    global $PAGE;

    $PAGE->requires->strings_for_js(array('insert',
                                          'cancel',
                                          'dialogtitle'),
                                    'atto_ilosbutton');
}

/**
 * Return the js params required for this module.
 *
 * @param int $elementid
 * @param array $options
 * @param array $fpoptions
 * @return array of additional params to pass to javascript init function for this module.
 */
function atto_ilosbutton_params_for_js($elementid, $options, $fpoptions) {

    global $USER, $COURSE, $DB;

    $coursecontext = context_course::instance($COURSE->id);

    // Gets Ilos folder ID and for course from database on the server to which the course was provisioned.
    // If the course has not been provisioned, this will not return a value and the user will be able to select
    // Folders and videos from the server specified as default during the plugin setup.
    $ilosid = $DB->get_field('block_ilos_foldermap', 'ilos_id', array('moodleid' => $coursecontext->instanceid));
    $servername = $DB->get_field('block_ilos_foldermap', 'ilos_server', array('moodleid' => $coursecontext->instanceid));

    $usercontextid = context_user::instance($USER->id)->id;
    $disabled = false;

    // Config array.
    $params = array();
    $params['usercontextid'] = $usercontextid;
    $params['coursecontext'] = $ilosid;
    $params['servename'] = $servername;

    // If they don't have permission don't show it.
    if (!has_capability('atto/ilosbutton:visible', $coursecontext) ) {
        $disabled = true;
    }

    // Add disabled param.
    $params['disabled'] = $disabled;

    // Add our default server.
    $params['defaultserver'] = get_config('atto_ilosbutton', 'defaultserver');

    return $params;
}
