/*//////////////////////////////////////////////////////////
////////////////// Set up the Data /////////////////////////
//////////////////////////////////////////////////////////*/

var NameProvider = ["Canada","UK","Lux","Hong Kong","China","USA","Mexico","Other"];
	
var matrix = [
[9.6899,0.8859,0.0554,0.443,2.5471,2.4363,0.5537,2.5471], /*Canada 19.1584*/
[0.1107,1.8272,0,0.4983,1.1074,1.052,0.2215,0.4983], /*UK 5.3154*/
[0.0554,0.2769,0.2215,0.2215,0.3876,0.8306,0.0554,0.3322], /*Lux 2.3811*/
[0.0554,0.1107,0.0554,1.2182,1.1628,0.6645,0.4983,1.052], /*Hong Kong 4.8173*/
[0.2215,0.443,0,0.2769,10.4097,1.2182,0.4983,2.8239], /*China 15.8915*/
[1.1628,2.6024,0,1.3843,8.7486,16.8328,1.7165,5.5925], /*USA 38.0399*/
[0.0554,0.4983,0,0.3322,0.443,0.8859,1.7719,0.443], /*Mexico 4.4297*/
[0.2215,0.7198,0,0.3322,1.6611,1.495,0.1107,5.4264] /*Other 9.9667*/
];
/*Sums up to exactly 100*/

var colors = ["#C4C4C4","#69B40F","#EC1D25","#C8125C","#008FC8","#10218B","#134B24","#737373"];

/*Initiate the color scale*/
var fill = d3.scale.ordinal()
    .domain(d3.range(NameProvider.length))
    .range(colors);
	
/*//////////////////////////////////////////////////////////
/////////////// Initiate Chord Diagram /////////////////////
//////////////////////////////////////////////////////////*/

var width = 650,
    height = 600,
	hPad = 20
    innerRadius = Math.min(width, height) * .39,
    outerRadius = innerRadius * 1.04;

/*Initiate the SVG*/
var svg = d3.select("#chart").append("svg:svg")
    .attr("width", width+50)
    .attr("height", height+20)
	.append("svg:g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2 + hPad) + ")");

	
var chord = d3.layout.chord()
    .padding(.04)
    .sortSubgroups(d3.descending) /*sort the chords inside an arc from high to low*/
    .sortChords(d3.descending) /*which chord should be shown on top when chords cross. Now the biggest chord is at the bottom*/
	.matrix(matrix);
	

/*//////////////////////////////////////////////////////////
////////////////// Draw outer Arcs /////////////////////////
//////////////////////////////////////////////////////////*/

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);
	
var g = svg.selectAll("g.group")
	.data(chord.groups)
	.enter().append("svg:g")
	.attr("class", function(d) {return "group " + NameProvider[d.index];});
	
g.append("svg:path")
	 .attr("class", "arc")
	 .style("stroke", function(d) { return fill(d.index); })
	 .style("fill", function(d) { return fill(d.index); })
	 .attr("d", arc)
	 .style("opacity", 0)
	 .transition().duration(1000)
	 .style("opacity", 0.4);

/*//////////////////////////////////////////////////////////
////////////////// Initiate Ticks //////////////////////////
//////////////////////////////////////////////////////////*/

var ticks = svg.selectAll("g.group").append("svg:g")
	.attr("class", function(d) {return "ticks " + NameProvider[d.index];})
	.selectAll("g.ticks")
	.attr("class", "ticks")
    .data(groupTicks)
	.enter().append("svg:g")
    .attr("transform", function(d) {
      return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
          + "translate(" + outerRadius+40 + ",0)";
    });

/*Append the tick around the arcs*/
ticks.append("svg:line")
	.attr("x1", 1)
	.attr("y1", 0)
	.attr("x2", 5)
	.attr("y2", 0)
	.attr("class", "ticks")
	.style("stroke", "#FFF");
	
/*Add the labels for the %'s*/
ticks.append("svg:text")
	.attr("x", 8)
	.attr("dy", ".35em")
	.attr("class", "tickLabels")
	.attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
	.style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
	.text(function(d) { return d.label; })
	.attr('opacity', 0);
	
/*//////////////////////////////////////////////////////////
////////////////// Initiate Names //////////////////////////
//////////////////////////////////////////////////////////*/

g.append("svg:text")
  .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
  .attr("dy", ".35em")
  .attr("class", "titles")
  .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
  .attr("transform", function(d) {
		return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
		+ "translate(" + (innerRadius + 55) + ")"
		+ (d.angle > Math.PI ? "rotate(180)" : "");
  })
  .attr('opacity', 0)
  .text(function(d,i) { return NameProvider[i]; });  

/*//////////////////////////////////////////////////////////
//////////////// Initiate inner chords /////////////////////
//////////////////////////////////////////////////////////*/

var chords = svg.selectAll("path.chord")
	.data(chord.chords)
	.enter().append("svg:path")
	.attr("class", "chord")
	.style("stroke", function(d) { return d3.rgb(fill(d.source.index)).darker(); })
	.style("fill", function(d) { return fill(d.source.index); })
	.attr("d", d3.svg.chord().radius(innerRadius))
	.attr('opacity', 0);

/*//////////////////////////////////////////////////////////	
///////////// Initiate Progress Bar ////////////////////////
//////////////////////////////////////////////////////////*/
/*Initiate variables for bar*/
var progressColor = ["#D1D1D1","#949494"],
	progressClass = ["prgsBehind","prgsFront"],
	prgsWidth = 0.4*650,
	prgsHeight = 3;
/*Create SVG to visualize bar in*/
var progressBar = d3.select("#progress").append("svg")
	.attr("width", prgsWidth)
	.attr("height", 3*prgsHeight);
/*Create two bars of which one has a width of zero*/
progressBar.selectAll("rect")
	.data([prgsWidth, 0])
	.enter()
	.append("rect")
	.attr("class", function(d,i) {return progressClass[i];})
	.attr("x", 0)
	.attr("y", 0)
	.attr("width", function (d) {return d;})
	.attr("height", prgsHeight)
	.attr("fill", function(d,i) {return progressColor[i];});

/*//////////////////////////////////////////////////////////	
/////////// Initiate the Center Texts //////////////////////
//////////////////////////////////////////////////////////*/
/*Create wrapper for center text*/
var textCenter = svg.append("g")
					.attr("class", "explanationWrapper");

/*Starting text middle top*/
var middleTextTop = textCenter.append("text")
	.attr("class", "explanation")
	.attr("text-anchor", "middle")
	.attr("x", 0 + "px")
	.attr("y", -24*10/2 + "px")
	.attr("dy", "1em")
	.attr("opacity", 1)
	.text("A Chord diagram for wires by the top countries by Percent Value")
	.call(wrap, 350);

/*Starting text middle bottom*/
var middleTextBottom = textCenter.append("text")
	.attr("class", "explanation")
	.attr("text-anchor", "middle")
	.attr("x", 0 + "px")
	.attr("y", 24*3/2 + "px")
	.attr("dy", "1em")
	.attr('opacity', 1)
	.text("The data pulled is 12 months of data for all wires in the US via  the wires database")
	.call(wrap, 350);


/*//////////////////////////////////////////////////////////
//////////////// Storyboarding Steps ///////////////////////
//////////////////////////////////////////////////////////*/

var counter = 1,
	buttonTexts = ["Ok","Go on","Continue","Okay","Go on","Continue","Okay","Continue",
				  "Continue","Continue","Continue","Continue","Continue","Finish"],
	opacityValueBase = 0.8,
	opacityValue = 0.4;

/*Reload page*/
d3.select("#reset")
	.on("click", function(e) {location.reload();});

/*Skip to final visual right away*/
d3.select("#skip")
	.on("click", finalChord);
	
/*Order of steps when clicking button*/
d3.select("#clicker")      
	.on("click", function(e){
	
		if(counter == 1) Draw1();
		else if(counter == 2) Draw2();
		else if(counter == 3) Draw3();
		else if(counter == 4) Draw4();
		else if(counter == 5) Draw5();
		else if(counter == 6) Draw6();
		else if(counter == 7) Draw7();
		else if(counter == 8) Draw8();
		else if(counter == 9) Draw9();
		else if(counter == 10) Draw10();
		else if(counter == 11) Draw11();
		else if(counter == 12) Draw12();
		else if(counter == 13) Draw13();
		else if(counter == 14) Draw14();
		else if(counter == 15) finalChord();
		
		counter = counter + 1;
	});

/*//////////////////////////////////////////////////////////	
//Introduction
///////////////////////////////////////////////////////////*/
function Draw1(){

	/*First disable click event on clicker button*/
	stopClicker();
		
	/*Show and run the progressBar*/
	runProgressBar(time=700*11);
		
	changeTopText(newText = "These days most people send wires out of the country. " + 
							"Some people send wires within the country...",
	loc = 4/2, delayDisappear = 0, delayAppear = 1);

	changeTopText(newText = "In the next few steps I would like to introduce you to the flows between countries ",
	loc = 8/2, delayDisappear = 9, delayAppear = 10, finalText = true);
	
	changeBottomText(newText = "Let's start by drawing out the division of the wires by country",
	loc = 1/2, delayDisappear = 0, delayAppear = 10);
	
	//Remove arcs again
	d3.selectAll(".arc")
		.transition().delay(9*700).duration(2100)
		.style("opacity", 0)
		.each("end", function() {d3.selectAll(".arc").remove();});
		
};/*Draw1*/

/*//////////////////////////////////////////////////////////	
//Show Arc of Canada
//////////////////////////////////////////////////////////*/
function Draw2(){ 

	/*First disable click event on clicker button*/
	stopClicker();
	
	/*Show and run the progressBar*/
	runProgressBar(time=700*2);
				
	/*Initiate all arcs but only show the Canada arc (d.index = 0)*/
	g.append("svg:path")
	 .style("stroke", function(d) { return fill(d.index); })
	 .style("fill", function(d) { return fill(d.index); })
	 .transition().duration(700)
	 .attr("d", arc)
	 .attrTween("d", function(d) {
		if(d.index == 0) {
		  var i = d3.interpolate(d.startAngle, d.endAngle);
		  return function(t) {
			  d.endAngle = i(t);
			return arc(d);
		  }
		}
	 });
	 
	/*Show the tick around the Canada arc*/
	d3.selectAll("g.group").selectAll("line")
		.transition().delay(700).duration(1000)
		.style("stroke", function(d, i, j) {return j ? 0 : "#000"; });

	/*Add the labels for the %'s at Canada*/
	d3.selectAll("g.group").selectAll(".tickLabels")
		.transition().delay(700).duration(2000)
		.attr("opacity", function(d, i, j) {return j ? 0 : 1; });

	/*Show the Canada name*/
	d3.selectAll(".titles")
	 .transition().duration(2000)
	 .attr("opacity", function(d, i) {return d.index ? 0 : 1; });
	 
	/*Switch  text*/
	changeTopText(newText = "According to the data 19% wires originate in Canada",
	loc = 1/2, delayDisappear = 0, delayAppear = 1, finalText = true);
	
	changeBottomText(newText = "",
	loc = 0/2, delayDisappear = 0, delayAppear = 1)	;
	
};/*Draw2*/

/*///////////////////////////////////////////////////////////  
//Draw the other arcs as well
//////////////////////////////////////////////////////////*/
function Draw3(){

	/*First disable click event on clicker button*/
	stopClicker();

	var arcDelay = [0,1,2,12,13,23,33,34,35,40,47];
	/*Show and run the progressBar*/
	runProgressBar(time=700*(arcDelay[(arcDelay.length-1)]+1));	
		
   /*Fill in the other arcs*/
   svg.selectAll("g.group").select("path")
	.transition().delay(function(d, i) { return 700*arcDelay[i];}).duration(1000)
	.attrTween("d", function(d) {
		if(d.index != 0) {
		  var i = d3.interpolate(d.startAngle, d.endAngle);
		  return function(t) {
			  d.endAngle = i(t);
			return arc(d);
		  }
		}
    });
 
  /*Make the other strokes black as well*/
  svg.selectAll("g.group")
	.transition().delay(function(d,i) { return 700*arcDelay[i]; }).duration(700)
	.selectAll("g").selectAll("line").style("stroke", "#000");
  /*Same for the %'s*/
  svg.selectAll("g.group")
	.transition().delay(function(d,i) { return 700*arcDelay[i]; }).duration(700)
	.selectAll("g").selectAll("text").style("opacity", 1);
  /*And the Names of each Arc*/	
  svg.selectAll("g.group")
	.transition().delay(function(d,i) { return 700*arcDelay[i]; }).duration(700)
	.selectAll("text").style("opacity", 1);

	/*Change the text of the top section inside the circle accordingly*/
	/*UK*/
	changeTopText(newText = "UK has 5% ",
		loc = 6/2, delayDisappear = 0, delayAppear = arcDelay[2]);
	/*Hong Kong*/
	changeTopText(newText = "Hong Kong has almost 5% ",
		loc = 6/2, delayDisappear = arcDelay[3], delayAppear = arcDelay[4]);
	/*USA*/
	changeTopText(newText = "USA has the biggest with 38% of wires from USA ",
		loc = 3/2, delayDisappear = (arcDelay[5]-1), delayAppear = arcDelay[5]);
	/*Mexico*/
	changeTopText(newText = "Mexico has slightly more than 4% share",
		loc = 4/2, delayDisappear = arcDelay[6], delayAppear = (arcDelay[8]-1));		
	/*100%*/
	changeTopText(newText = "Together that sums up to 100%",
		loc = 1/2, delayDisappear = (arcDelay[9]-1), delayAppear = arcDelay[9]);		
	/*Chord intro*/
	changeTopText(newText = "This circle shows how the wires are currently divided between countries",
		loc = 8/2, delayDisappear = (arcDelay[10]-1), delayAppear = arcDelay[10], finalText = true);					
	
	/*Change the text of the bottom section inside the circle accordingly*/
	/*Lux*/
	changeBottomText(newText = "Lux is 2.4% ",
		loc = -2/2, delayDisappear = 0, delayAppear = arcDelay[2]);
	/*China*/
	changeBottomText(newText = "China is 15% of the wires, though China law caps wires at 50k annually(more to come later).",
		loc = -1/2, delayDisappear = arcDelay[3], delayAppear = arcDelay[4]);	
	/*Other*/
	changeBottomText(newText = "Wires combined in \"Other\" are very small and are combined",
		loc = -1/2, delayDisappear = (arcDelay[5]-1), delayAppear = (arcDelay[8]-1));	
	/*Chord intro*/
	changeBottomText(newText = "Now we're going to look at how these wires flowed from their originating country to receiving country",
		loc = 1/2, delayDisappear = (arcDelay[9]-1), delayAppear = arcDelay[10]);	

};/*Draw3*/

/*///////////////////////////////////////////////////////////
//Show the chord between USA and China
//////////////////////////////////////////////////////////*/
function Draw4(){

	/*First disable click event on clicker button*/
	stopClicker();
	/*Show and run the progressBar*/
	runProgressBar(time=700*2);	
	
	/*USA and China intro text*/
	changeTopText(newText = "First, let's only look at the in the USA with wires from China ",
		loc = 5, delayDisappear = 0, delayAppear = 1, finalText = true);
		
	/*Bottom text disappear*/
	changeBottomText(newText = "",
		loc = 0, delayDisappear = 0, delayAppear = 1);	
	
    /*Make the non USA & China arcs less visible*/
    svg.selectAll("g.group").select("path")
		.transition().duration(1000)
		.style("opacity", function(d) {
			if(d.index != 4 && d.index != 5) {return opacityValue;}
		});		
	
	/*Make the other strokes less visible*/
	d3.selectAll("g.group").selectAll("line")
		.transition().duration(700)
		.style("stroke",function(d,i,j) {if (j == 5 || j == 4) {return "#000";} else {return "#DBDBDB";}});
	/*Same for the %'s*/
	svg.selectAll("g.group")
		.transition().duration(700)
		.selectAll(".tickLabels").style("opacity",function(d,i,j) {if (j == 5 || j == 4) {return 1;} else {return opacityValue;}});
	/*And the Names of each Arc*/	
	svg.selectAll("g.group")
		.transition().duration(700)
		.selectAll(".titles").style("opacity", function(d) { if(d.index == 4 || d.index == 5) {return 1;} else {return opacityValue;}});

	/*Show only the USA China chord*/
	chords.transition().duration(2000)
		.attr("opacity", function(d, i) { 
			if(d.source.index == 5 && d.target.index == 4) 
				{return opacityValueBase;}
			else {return 0;}
		});
	
};/*Draw4*/

/*//////////////////////////////////////////////////////////////////////////*/
function Draw5(){

	/*First disable click event on clicker button*/
	stopClicker();
	/*Show and run the progressBar*/
	runProgressBar(time=700*2);	
	
	/*USA and China text*/
	changeTopText(newText = "On the left, touching the arc of USA, we can see that the chord runs from 17% to almost 26%. Which is a thickness spanning 9%",
		loc = 5, delayDisappear = 0, delayAppear = 1, finalText = true);
	
    /*Make the non USA & China arcs less visible*/
    svg.selectAll("g.group").select("path")
		.transition().duration(1000)
		.style("opacity", opacityValue);		

	/*Show only the USA China part at USA*/
	var arcUSA = d3.svg.arc()
				.innerRadius(innerRadius)
				.outerRadius(outerRadius)
				.startAngle(4.040082626337902)
				.endAngle(4.561777856121815);
				
	svg.append("path")
		.attr("class","USAToChinaArc")
		.attr("d", arcUSA)
		.attr("fill", colors[5])
		.style('stroke', colors[5]);
		
	repeat();
	
	/*Repeatedly let an arc change colour*/
	function repeat() {
		d3.selectAll(".USAToChinaArc")
			.transition().duration(700)
			.attr("fill", "#9FA6D0")
			.style('stroke', "#9FA6D0")
			.transition().duration(700)
			.attr("fill", colors[5])
			.style('stroke', colors[5])
			.each("end", repeat)
			;
	};
	
};/*Draw5*/

/*//////////////////////////////////////////////////////////////////////////*/
function Draw6(){

	/*First disable click event on clicker button*/
	stopClicker();
	/*Show and run the progressBar*/
	runProgressBar(time=700*2);	
	
	/*USA and China text*/
	changeTopText(newText = "These 9% of the wires in the USA and by following the chord we can see where the wire came, which in this case, is China",
		loc = 5, delayDisappear = 0, delayAppear = 1, finalText = true);

	/*Show only the USA China part at China*/
	var arcChina = d3.svg.arc()
				.innerRadius(innerRadius)
				.outerRadius(outerRadius)
				.startAngle(2.837816067671451)
				.endAngle(2.9104595910835127);

	svg.append("path")
		.attr("class","ChinaToUSAArc")
		.attr("d", arcChina)
		.attr("opacity", 0)
		.attr("fill", colors[4])
		.transition().duration(700)
		.attr("opacity", 1)
		.attr("stroke", colors[4]);				
		
};/*Draw6*/

/*//////////////////////////////////////////////////////////////////////////*/
function Draw7(){

	/*First disable click event on clicker button*/
	stopClicker();
	/*Show and run the progressBar*/
	runProgressBar(time=700*11);	
	
	/*USA and China text*/
	changeTopText(newText = "At the China side, the arc is much thinner, only spanning 1.2% (of wires)",
		loc = 4, delayDisappear = 0, delayAppear = 1);
	changeTopText(newText = "These 1.2% are in  China, but by following the chord we can see that they had come from the USA",
		loc = 4, delayDisappear = 9, delayAppear = 10, finalText = true);
		
	/*Stop the color changing on the USA side*/
	d3.selectAll(".USAToChinaArc")
		.transition().duration(700)
		.attr("fill", colors[5])
		.style("stroke", colors[5]);

	/*Repeatedly let an arc change colour*/		
	repeat();
	function repeat() {
		d3.selectAll(".ChinaToUSAArc")
			.transition().duration(700)
			.attr("fill", "#99D2E9")
			.style('stroke', "#99D2E9")
			.transition().duration(700)
			.attr("fill", colors[4])
			.style("stroke", colors[4])
			.each("end", repeat)
			;
	};
				
};/*Draw7*/

/*//////////////////////////////////////////////////////////////////////////*/
function Draw8(){

	/*First disable click event on clicker button*/
	stopClicker();
	/*Show and run the progressBar*/
	runProgressBar(time=700*11);	
	
	/*USA and China text*/
	changeTopText(newText = "Since the chord is much wider at the USA side, USA has taken a lot more wires from China than China managed to take from USA",
		loc = 5, delayDisappear = 0, delayAppear = 1);
	changeTopText(newText = "Therefore, the chord is the color of USA blue, since USA has the net gain from the exchange of wires between China and USA",
		loc = 5, delayDisappear = 9, delayAppear = 10, finalText = true);
		
	/*Stop the colour changing on the China side*/
	d3.selectAll(".ChinaToUSAArc")
		.transition().duration(700)
		.attr("fill", colors[4])
		.style("stroke", colors[4]);
				
};/*Draw8*/

/*///////////////////////////////////////////////////////////	
//Show Loyalty hills
//////////////////////////////////////////////////////////*/
function Draw9(){

	/*First disable click event on clicker button*/
	stopClicker();
	/*Show and run the progressBar*/
	runProgressBar(time=700*20);	
	
	/*USA Loyal text*/
	changeTopText(newText = "There are also people that send wires internal to the country ",
		loc = 4/2, delayDisappear = 0, delayAppear = 1, finalText = false, xloc=-50, w=300);
	changeTopText(newText = "These wires are represented by the hills at each country",
		loc = 3/2, delayDisappear = 9, delayAppear = 10, finalText = false, xloc=-50, w=300);
	changeTopText(newText = "You can also envision this as a chord beginning and ending on itself",
		loc = 2/2, delayDisappear = 18, delayAppear = 19, finalText = true, xloc=-50, w=300);
		
	/*Remove the arcs*/
	d3.selectAll(".ChinaToUSAArc")
		.transition().duration(2000)
		.attr("opacity", 0)
		.each("end", function() {d3.selectAll(".ChinaToUSAArc").remove();});

	d3.selectAll(".USAToChinaArc")
		.transition().duration(2000)
		.attr("opacity", 0)
		.each("end", function() {d3.selectAll(".USAToChinaArc").remove();});
		
	/*Show only the loyal chords*/
	chords.transition().duration(2000)
		.attr("opacity", function(d, i) { 
			if(d.source.index == 0 && d.target.index == 0) {return opacityValueBase;}
			else if(d.source.index == 1 && d.target.index == 1) {return opacityValueBase;}
			else if(d.source.index == 2 && d.target.index == 2) {return opacityValueBase;}
			else if(d.source.index == 3 && d.target.index == 3) {return opacityValueBase;}
			else if(d.source.index == 4 && d.target.index == 4) {return opacityValueBase;}
			else if(d.source.index == 5 && d.target.index == 5) {return opacityValueBase;}
			else if(d.source.index == 6 && d.target.index == 6) {return opacityValueBase;}
			else if(d.source.index == 7 && d.target.index == 7) {return opacityValueBase;}
			else {return 0;}
		});
	
		
	/*Show all ticks and texts again*/
	/*Ticks*/
	d3.selectAll("g.group").selectAll("line")
		.transition().duration(700)
		.style("stroke", "#000");
	/*Same for the %'s*/
	svg.selectAll("g.group")
		.transition().duration(700)
		.selectAll(".tickLabels").style("opacity", 1);
	/*And the Names of each Arc*/	
	svg.selectAll("g.group")
		.transition().duration(700)
		.selectAll(".titles").style("opacity", 1);
				
};/*Draw9*/

/*//////////////////////////////////////////////////////////////////////////*/
function Draw10(){

	/*First disable click event on clicker button*/
	stopClicker();
	/*Show and run the progressBar*/
	runProgressBar(time=700*11);
	
	changeTopText(newText = "10% of wires have a wire from China inside of China",
		loc = 7/2, delayDisappear = 0, delayAppear = 1);
		changeTopText(newText = "Seeing that currently China is  almost 16% of wires, this means "+ 
								"that about 2/3 of current China owners are people doing wires inside of China",
		loc = 7/2, delayDisappear = 9, delayAppear = 10, finalText = true);
		
	/*Show only the China Loyal arc*/
	var arcChina = d3.svg.arc()
				.innerRadius(innerRadius)
				.outerRadius(outerRadius)
				.startAngle(2.048671976860533)
				.endAngle(2.6694216777820063);

	svg.append("path")
		.attr("class","ChinaLoyalArc")
		.attr("d", arcChina)
		.attr("opacity", 1)
		.attr("stroke", colors[4])
		.attr("fill", colors[4]);	

	/*Repeatedly let an arc change colour*/		
	repeat();
	
	function repeat() {
		d3.selectAll(".ChinaLoyalArc")
			.transition().duration(700)
			.attr("fill", "#99D2E9")
			.style('stroke', "#99D2E9")
			.transition().duration(700)
			.attr("fill", colors[4])
			.style("stroke", colors[4])
			.each("end", repeat);
	};
	
	/*Show only the China loyal chord*/
	chords.transition().duration(2000)
		.attr("opacity", function(d, i) { 
			if(d.source.index == 4 && d.target.index == 4) {return opacityValueBase;}
			else {return 0;}
		});		

	/*Make the other strokes less visible*/
	d3.selectAll("g.group").selectAll("line")
		.transition().duration(700)
		.style("stroke",function(d,i,j) {if (j == 4) {return "#000";} else {return "#DBDBDB";}});
	/*Same for the %'s*/
	svg.selectAll("g.group")
		.transition().duration(700)
		.selectAll(".tickLabels").style("opacity",function(d,i,j) {if (j == 4) {return 1;} else {return opacityValue;}});
	/*And the Names of each Arc*/	
	svg.selectAll("g.group")
		.transition().duration(700)
		.selectAll(".titles").style("opacity", function(d) { if(d.index == 4) {return 1;} else {return opacityValue;}});

};/*Draw10*/

/*//////////////////////////////////////////////////////////
//Show all chords that are connected to Canada
//////////////////////////////////////////////////////////*/
function Draw11(){

	/*First disable click event on clicker button*/
	stopClicker();
	/*Show and run the progressBar*/
	runProgressBar(time=700*2);	
	
	changeTopText(newText = "Here are all the chords for those wires that originate in Canada "+ 
							"and move inside of Canada",
		loc = 3/2, delayDisappear = 0, delayAppear = 1, finalText = true, xloc=-80, w=200);
		
	/*Remove the China arc*/
	d3.selectAll(".ChinaLoyalArc")
		.transition().duration(1000)
		.attr("opacity", 0)
		.each("end", function() {d3.selectAll(".ChinaLoyalArc").remove();});
			
	/*Only show the chords of Canada*/
	chords.transition().duration(2000)
    .attr("opacity", function(d, i) { 
		if(d.source.index == 0 || d.target.index == 0) {return opacityValueBase;}
		else {return 0;}
	});

	/*Highlight arc of Canada*/
	svg.selectAll("g.group").select("path")
		.transition().duration(2000)
		.style("opacity", function(d) {
			if(d.index != 0) {return opacityValue;}
		});	
		
	/*Show only the ticks and text at Canada*/
	/*Make the other strokes less visible*/
	d3.selectAll("g.group").selectAll("line")
		.transition().duration(700)
		.style("stroke",function(d,i,j) {if (j == 0) {return "#000";} else {return "#DBDBDB";}});
	/*Same for the %'s*/
	svg.selectAll("g.group")
		.transition().duration(700)
		.selectAll(".tickLabels").style("opacity",function(d,i,j) {if (j == 0) {return 1;} else {return opacityValue;}});
	/*And the Names of each Arc*/	
	svg.selectAll("g.group")
		.transition().duration(700)
		.selectAll(".titles").style("opacity", function(d) { if(d.index == 0) {return 1;} else {return opacityValue;}});

};/*Draw11*/

function Draw12(){

	/*First disable click event on clicker button*/
	stopClicker();
	/*Show and run the progressBar*/
	runProgressBar(time=700*11);	

	changeTopText(newText = "One thing that stands out for Canada is that all chords connected to " +
							"Canada are the color of the Canada arc: grey",
		loc = 3/2, delayDisappear = 0, delayAppear = 1, finalText = false, xloc=-80, w=210);
	changeTopText(newText = "This means that Canada has always had the net gain. " + 
							"They received more wires from other countries than they sent to them",
		loc = 3/2, delayDisappear = 9, delayAppear = 10, finalText = true, xloc=-80, w=210);

};/*Draw12*/
  
  
function Draw13(){

	/*First disable click event on clicker button*/
	stopClicker();
	/*Show and run the progressBar*/
	runProgressBar(time=700*11);	

	changeTopText(newText = "Even more so, apart from the chord to USA, all other chords are extremely narrow at the other end from Canada",
		loc = 3/2, delayDisappear = 0, delayAppear = 1, finalText = false, xloc=-80, w=200);
	changeTopText(newText = "This means that Canada has a net inflow of wires",
		loc = 3/2, delayDisappear = 9, delayAppear = 10, finalText = true, xloc=-80, w=200);	
	
	/*Repeatedly let specific chords change colour*/
	repeat();
	
	function repeat() {
		chords
			.transition().duration(1000)
			.style("opacity",function (d){
				if(d.source.index == 0) {
					if(d.target.index == 0 || d.target.index == 5) {return opacityValueBase;}
					else {return 0.2;}
				} else {return 0;}
			})
			.transition().duration(1000)
			.style("opacity",function (d){
				if(d.source.index == 0) {return opacityValueBase;}
				else {return 0;}
			})
			.each("end", repeat);
	};	
};/*Draw13*/


function Draw14(){

	/*First disable click event on clicker button*/
	stopClicker();
	/*Show and run the progressBar*/
	/*runProgressBar(time=700*2);*/

	changeTopText(newText = "Enjoy! " + 
							"if you mouse over the arc you'll highlight the cords",
		loc = 8/2, delayDisappear = 0, delayAppear = 1, finalText = true);
		
	changeBottomText(newText = "I built this from scratch, yeah right..check out D3 and SVG scripts",
		loc = 3/2, delayDisappear = 0, delayAppear = 1);		
	
	/*Only show the chords of Canada*/
	chords.transition().duration(1000)
		.style("opacity", 0.1);

	/*Hide all the text*/
	d3.selectAll("g.group").selectAll("line")
		.transition().duration(700)
		.style("stroke","#DBDBDB");
	/*Same for the %'s*/
	svg.selectAll("g.group")
		.transition().duration(700)
		.selectAll(".tickLabels").style("opacity",0.4);
	/*And the Names of each Arc*/	
	svg.selectAll("g.group")
		.transition().duration(700)
		.selectAll(".titles").style("opacity",0.4);	
		
};/*Draw14*/

/*///////////////////////////////////////////////////////////
//Draw the original Chord diagram
///////////////////////////////////////////////////////////*/
/*Go to the final bit*/
function finalChord() {
	
	/*Remove button*/
	d3.select("#clicker")
		.style("visibility", "hidden");
	d3.select("#skip")
		.style("visibility", "hidden");
	d3.select("#progress")
		.style("visibility", "hidden");
	
	/*Remove texts*/
	changeTopText(newText = "",
		loc = 0, delayDisappear = 0, delayAppear = 1);
	changeBottomText(newText = "",
		loc = 0, delayDisappear = 0, delayAppear = 1);			

	/*Create arcs or show them, depending on the point in the visual*/
	if (counter <= 4 ) {
		g.append("svg:path")
		 .style("stroke", function(d) { return fill(d.index); })
		 .style("fill", function(d) { return fill(d.index); })
		 .attr("d", arc)
		 .style("opacity", 0)
		 .transition().duration(1000)
		 .style("opacity", 1);
		 
	} else {
		/*Make all arc visible*/
		svg.selectAll("g.group").select("path")
			.transition().duration(1000)
			.style("opacity", 1);
	};
	
	/*Make mouse over and out possible*/
	d3.selectAll(".group")
		.on("mouseover", fade(.02))
		.on("mouseout", fade(.80));
		
	/*Show all chords*/
	chords.transition().duration(1000)
		.style("opacity", opacityValueBase);

	/*Show all the text*/
	d3.selectAll("g.group").selectAll("line")
		.transition().duration(100)
		.style("stroke","#000");
	/*Same for the %'s*/
	svg.selectAll("g.group")
		.transition().duration(100)
		.selectAll(".tickLabels").style("opacity",1);
	/*And the Names of each Arc*/	
	svg.selectAll("g.group")
		.transition().duration(100)
		.selectAll(".titles").style("opacity",1);		

};/*finalChord*/

/*//////////////////////////////////////////////////////////
////////////////// Extra Functions /////////////////////////
//////////////////////////////////////////////////////////*/

/*Returns an event handler for fading a given chord group*/
function fade(opacity) {
  return function(d, i) {
    svg.selectAll("path.chord")
        .filter(function(d) { return d.source.index != i && d.target.index != i; })
		.transition()
        .style("stroke-opacity", opacity)
        .style("fill-opacity", opacity);
  };
};/*fade*/

/*Returns an array of tick angles and labels, given a group*/
function groupTicks(d) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, 1).map(function(v, i) {
    return {
      angle: v * k + d.startAngle,
      label: i % 5 ? null : v + "%"
    };
  });
};/*groupTicks*/

/*Taken from https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
//Calls a function only after the total transition ends*/
function endall(transition, callback) { 
    var n = 0; 
    transition 
        .each(function() { ++n; }) 
        .each("end", function() { if (!--n) callback.apply(this, arguments); }); 
};/*endall*/ 

/*Taken from http://bl.ocks.org/mbostock/7555321
//Wraps SVG text*/
function wrap(text, width) {
    var text = d3.select(this)[0][0],
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.4, 
        y = text.attr("y"),
		x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
		
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      };
    };  
};

/*Transition the top circle text*/
function changeTopText (newText, loc, delayDisappear, delayAppear, finalText, xloc, w) {

	/*If finalText is not provided, it is not the last text of the Draw step*/
	if(typeof(finalText)==='undefined') finalText = false;
	
	if(typeof(xloc)==='undefined') xloc = 0;
	if(typeof(w)==='undefined') w = 350;
	
	middleTextTop	
		/*Current text disappear*/
		.transition().delay(700 * delayDisappear).duration(700)
		.attr('opacity', 0)	
		/*New text appear*/
		.call(endall,  function() {
			middleTextTop.text(newText)
			.attr("y", -24*loc + "px")
			.attr("x", xloc + "px")
			.call(wrap, w);	
		})
		.transition().delay(700 * delayAppear).duration(700)
		.attr('opacity', 1)
		.call(endall,  function() {
			if (finalText == true) {
				d3.select("#clicker")
					.text(buttonTexts[counter-2])
					.style("pointer-events", "auto")
					.transition().duration(400)
					.style("border-color", "#363636")
					.style("color", "#363636");
				};
		});
};/*changeTopText */

/*Transition the bottom circle text*/
function changeBottomText (newText, loc, delayDisappear, delayAppear) {
	middleTextBottom
		/*Current text disappear*/
		.transition().delay(700 * delayDisappear).duration(700)
		.attr('opacity', 0)
		/*New text appear*/
		.call(endall,  function() {
			middleTextBottom.text(newText)
			.attr("y", 24*loc + "px")
			.call(wrap, 350);	
		})
		.transition().delay(700 * delayAppear).duration(700)
		.attr('opacity', 1);
;}/*changeTopText*/

/*Stop clicker from working*/
function stopClicker() {
	d3.select("#clicker")
		.style("pointer-events", "none")
		.transition().duration(400)
		.style("border-color", "#D3D3D3")
		.style("color", "#D3D3D3");
};/*stopClicker*/

/*Run the progress bar during an animation*/
function runProgressBar(time) {	
	
	/*Make the progress div visible*/
	d3.selectAll("#progress")
		.style("visibility", "visible");
	
	/*Linearly increase the width of the bar
	//After it is done, hide div again*/
	d3.selectAll(".prgsFront")
		.transition().duration(time).ease("linear")
		.attr("width", prgsWidth)
		.call(endall,  function() {
			d3.selectAll("#progress")
				.style("visibility", "hidden");
		});
	
	/*Reset to zero width*/
	d3.selectAll(".prgsFront")
		.attr("width", 0);
		
};/*runProgressBar*/
