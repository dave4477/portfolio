<?

class ProjectDescription 
{
	var $img;
	var $client;
	var $projecttype;
	var $projectname;
	var $info;
	var $url;
	var $role;
	var $date;
	
	function ProjectDescription($img, $client, $projecttype, $projectname, $info, $url, $role, $date)
	{
		$this->img			= $img;
		$this->client		= $client;
		$this->projecttype	= $projecttype;
		$this->projectname	= $projectname;
		$this->info			= $info;
		$this->url			= $url;
		$this->role			= $role;
		$this->date			= $date;
		
	}
}


?>