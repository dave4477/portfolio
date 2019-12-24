<?

/**
 * Fetches any variables using a POST, GET or REQUEST and makes them safe for MySQL insertion.
 *
 * @author	Dave Bleeker
 * @copyright	Detailed Simplicity 2010
 * @version	1.0
 * @todo	implement something like: foreach($_POST as $key=>$value) to clean all variables send at once.
 *		implement PUT and DELETE.
 *		implement a check to see if the variable really is text and not for example an array.
 *
 * @require	A connection to a mySQL database in order to use mysql_real_escape_string.
 *
 * @usage
 *
 * $cp->post('action');		// Contains a posted action.
 * $cp->post('name');		// Contains a posted name
 * $cp->post('email');		// Contains a posted email
 * $cp->post('message',TRUE);	// Contains a posted message and converts URLs to HTML links.
 */

class cleanPost
{
  /**
   * Puts a space before a linebreak, so that the word 
   * on a new line, directly after a link, without spaces,
   * is not seen as a part of the link.
   * 
   * Replaces www on a newline of text with http://www.
   *
   * @param	A string of text to do the replacements.
   * @return	The new string.
   */
  function fixBreaks($text)
  {
    $order = array("\r\n"); 
    $replace = " \r\n";
    $text = str_replace($order, $replace, $text);

    $order = array("\r\nwww."); 
    $replace = " \r\nhttp://www.";
    $text = str_replace($order, $replace, $text);

    return $text;
  }  

  /**
   * Create HTML links from URLs found in the raw text. 
   *
   * @param	A string of text that contains the URLs.
   * @return	A string of text containing links in HTML format. 
   */
  function fixLinks($text)
  {
    $text = str_replace("\r\nwww.", "\r\nhttp://www.", $text);
    $text = str_replace(" www.", " http://www.", $text);
    $text = preg_replace("/(http:\/\/[^\s]+)/", "<a href=\"$1\">$1</a>", $text); 


    return $text;

  }

  /**
   * Fetch a certain posted variable and makes it safe for database insertion. 
   *
   * @param	The variable that was posted (for example action in $_POST['action']).
   * @param	Optional. A boolean value whether to format URLs in the posted parameter or not. Default is FALSE.


   * @return	A string of text, safe to insert into a MySQL database. 
   */
  function post($arg, $fixlinks = FALSE)
  {
    $var = (isset($_POST[$arg])) ? $_POST[$arg] : "";

    $var = $this->fixBreaks($var);
    $var = mysql_real_escape_string(htmlentities($var,ENT_QUOTES));

    if ($fixlinks) $var = $this->fixlinks($var);
    return $var;
  }

  /**
   * Fetch a certain GET variable and makes it safe for database insertion. 
   *
   * @param	The variable to fetch with a GET (for example action in $_GET['action']).
   * @param	Optional. A boolean value whether to format URLs in the $_GET parameter or not. Default is FALSE.


   * @return	A string of text, safe to insert into a MySQL database (it is always better to post things you want to put in your databse). 
   */
  function get($arg, $fixlinks = FALSE)
  {
    $var = (isset($_GET[$arg])) ? $_GET[$arg] : "";

    $var = $this->fixBreaks($var);
    $var = mysql_real_escape_string(htmlentities($var,ENT_QUOTES));

    if ($fixlinks) $var = $this->fixlinks($var);
    return $var;
  }

  /**
   * Fetch a certain REQUEST variable and makes it safe for database insertion. 
   *
   * @param	The variable to fetch with a REQUEST (for example action in $_REQUEST['action']).
   * @param	Optional. A boolean value whether to format URLs in the $_REQUEST parameter or not. Default is FALSE.


   * @return	A string of text, safe to insert into a MySQL database (forms etc. are always better to post instead of GET or REQUEST). 
   */
  function request($arg, $fixlinks = FALSE)
  {
    $var = (isset($_REQUEST[$arg])) ? $_REQUEST[$arg] : "";

    $var = $this->fixBreaks($var);
    $var = mysql_real_escape_string(htmlentities($var,ENT_QUOTES));

    if ($fixlinks) $var = $this->fixlinks($var);
    return $var;
  }
}

class CP extends cleanPost {};

$cp = new cleanPost;

?>