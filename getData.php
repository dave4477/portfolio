<?

	require("database.php");
	require("cleanPost.php");
	require("PortfolioCollection.php");
	require("ProjectDescription.php");
	require("InfoText.php");
	require("jsonwrapper.php");
	
	$table	= "portfolio2";
	$table_text = "data";
	
	$action = $cp->request("action");
	$id		= $cp->request("id");
	$cat	= $cp->request("category");
	$needle	= $cp->request("needle");
	
	$collection = array();
	
	if ($action == "portfolio") {
		if (empty($cat)) {
			$cat = "Flash Games";
		}

		if ($cat == "All") {
			$main_query = "select * from `$table` where `thumb` != ''";		
		} else {
			$main_query = "select * from `$table` where find_in_set('" .$cat. "', `category`) AND `thumb` != ''";
		}
		$main_result = $foo->query($main_query);
		$numrows = $foo->numrows($main_result);
		
		for ($i = 0; $i < $numrows; $i++) {
			$id = $foo->result($main_result, $i, 'id');
			$thumb = $foo->result($main_result, $i, 'thumb');
			
			$collection[] = new PortfolioCollection($id, $thumb);
		}
		print json_encode($collection);
		
	} else if ($action == "project" &&! empty($id)) {
		$main_query = "select *, date_format(`date`, '%M %Y') as `prettydate` from `$table` where `id` = '$id'";
		$main_result = $foo->query($main_query);
		$numrows = $foo->numrows($main_result);
		
		for ($i = 0; $i < $numrows; $i++) {
			$img = $foo->result($main_result, $i, 'img');
			$client = $foo->result($main_result, $i, 'client');
			$projecttype = $foo->result($main_result, $i, 'projecttype');
			$projectname = $foo->result($main_result, $i, 'projectname');
			$info = $foo->result($main_result, $i, 'info');
			$url = $foo->result($main_result, $i, 'url');
			$role = $foo->result($main_result, $i, 'role');
			$date = $foo->result($main_result, $i, 'prettydate');
			
			$collection[] = new ProjectDescription($img, $client, $projecttype, $projectname, $info, $url, $role, $date);
		}
		print json_encode($collection);	
	} else if ($action == "search" &&! empty($needle)) {
		$main_query = "select * from `$table` where `client` like '%$needle%' or `projecttype` like '%$needle%' or `projectname` like '%$needle%' or `info` like '%$needle%' or `role` like '%$needle%' or `date` like '%$needle%'";
		$main_result = $foo->query($main_query);
		$numrows = $foo->numrows($main_result);
		
		for ($i = 0; $i < $numrows; $i++) {
			$id = $foo->result($main_result, $i, 'id');
			$thumb = $foo->result($main_result, $i, 'thumb');
			
			$collection[] = new PortfolioCollection($id, $thumb);
		}
		print json_encode($collection);		
	} else if ($action == "text" &&! empty($id)) {
		$main_query = "select * from `$table_text` where `id`='$id'";
		$main_result = $foo->query($main_query);
		$numrows = $foo->numrows($main_result);
		if ($numrows < 1) {
			$collection = new InfoText(NULL, "<p>Item not found in database.</p>");
		}
		for ($i = 0; $i < $numrows; $i++) {
			$img = NULL;
			$info = $foo->result($main_result, $i, 'text');
			
			$info = str_replace("\r\n", "", $info);
			$collection = new InfoText($img, $info);
		}
		print json_encode($collection);
	}


?>