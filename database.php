<?

//======================================//
//        Database Configuration	//
//======================================//

define("DB_HOST",	'localhost');
define("DB_NAME",	'detailedsimplicity');
define("DB_USER", 	'dave');
define("DB_PASS",	'not24get');

class DBmysql
{
  var $Hostname	= DB_HOST;
  var $Username	= DB_USER;
  var $Password	= DB_PASS;
  var $Database	= DB_NAME;

  function Connect()
  {
    mysql_connect($this->Hostname, $this->Username, $this->Password);
    mysql_select_db($this->Database);
  }

  function query($query)
  {
    $res = mysql_query($query);
    $errn = mysql_errno();
    if ($errn <> 0)
    {
      $errm = mysql_error();
      die("
          <br><br><table><col style=\"width:100px;\">
          <caption class=\"error\">Database Fout</caption>
	  <tr><td>Query&nbsp;failed:</td><td>$query</td></tr>
          <tr><td>Message:</td><td>$errm</td></tr></table><br>
        ");
    }
    return $res;
  }

  function queryEX($query)  # ONLY to be called in combination with this->error()
  {
    return mysql_query($query);
  }

  function error()
  {
    $errn = mysql_errno();
    $errm = mysql_error();
    if ($errn <> 0)
    {
      return "Error $errn: $errm";
    }
    else
    {
      return '';
    }
  }

  function numrows($result)
  {
    if ($result != '') { return mysql_numrows($result); }
    else { return 0; }
  }
 
  function numfields($result)
  {
    if ($result != '') { return mysql_numfields($result); }
    else { return 0; }
  }

  function result($result, $i, $field)
  {
    if ($this->numrows($result) > $i) 
    {
      return mysql_result($result, $i, $field); 
    }
    else 
    { 
      return ''; 
    }
  }

  function fetch_array($result)
  {
    return mysql_fetch_array($result);
  }

  function field_type($result, $i)
  {
    return mysql_field_type($result, $i);
  }

  function free_result($result)
  {
    mysql_free_result($result);
  }
}

class DB extends DBmysql{}
$foo = new DB;
$foo->Connect();



?>