ruleset io.picolabs.manage_sensors {
  meta {
    shares __testing, sensors, temperatures, get_all_temperatures
    use module io.picolabs.wrangler alias wrangler
  }
  global {
    __testing = { "queries":
      [ { "name": "__testing" }
      //, { "name": "entry", "args": [ "key" ] }
      ] , "events":
      [ //{ "domain": "d1", "type": "t1" }
      //, { "domain": "d2", "type": "t2", "attrs": [ "a1", "a2" ] }
      ]
    }
    sensors = function(){
      ent:sensors.defaultsTo({})
    }
    temperatures = function(){
      ent:temperatures.defaultsTo({})
    }
    location = "SLC"
    threshold = 70
    number = "+18018089633"
    
    get_all_temperatures = function(){
      wrangler:children().map(function(x){
        eci = x{"eci"};
        url = "http://localhost:8080/sky/cloud/" + eci + "/io.picolabs.temperature_store/temperatures";
        {}.put(x{"name"}, http:get(url){"content"}.decode())
      });
    }
  }
  
  rule add_sensor{
    select when sensor new_sensor
    pre{
      name = event:attr("name")
      section_id = event:attr("section_id")
      sensor_contains = ent:sensors.filter(function(v,k){ name >< k })
    }
    if sensor_contains == {} then
      send_directive("valid_input", {"name": name, "section_id": section_id})
    fired{
      raise wrangler event "child_creation"
        attributes { "name":  name, "rids": ["io.picolabs.temperature_store", "io.picolabs.wovyn_base", "io.picolabs.sensor_profile", "io.picolabs.logging"], "section_id": section_id}
    }else{
      raise sensor event "duplicated_name"
        attributes{ "name": name }
    }
  }
  
  rule duplicated_name{
    select when sensor duplicated_name
      send_directive("duplicated_name", {"name": event:attr("name"), "sensors": ent:sensors})
  }
  
  rule store_new_section {
    select when wrangler child_initialized
    pre {
      the_section = {"id": event:attr("id"), "eci": event:attr("eci")}
      section_id = event:attr("rs_attrs"){"section_id"}.klog("section_id")
      name = event:attr("name")
    }
    if section_id.klog("found section_id") then
      event:send(
       { "eci": the_section{"eci"}, "eid": "update-profile",
         "domain": "sensor", "type": "profile_updated",
         "attrs": { 
                    "location" : location,
                    "name" : name,
                    "threshold" : threshold,
                    "number" : number
                   }
        });
      
    fired {
      ent:sensors := ent:sensors.defaultsTo({});
      ent:sensors{[name]} := the_section{"eci"}.klog("Section added");
    }else{
      
    }
  }
  
  
  rule unneeded_sensor {
    select when sensor unneeded_sensor
    pre{
      child_to_delete = event:attr("name")
      exists = ent:sensors.filter(function(v,k){ child_to_delete >< k })
      new_sensors = ent:sensors.filter(function(v,k){ not(child_to_delete >< k) })
    }
    if exists != {} then
      send_directive("unneeded_sensor", {"child_to_delete": child_to_delete, "new_sensors": new_sensors})
    fired{
      ent:sensors := new_sensors;
      raise wrangler event "child_deletion"
        attributes {"name": child_to_delete};
    }
  }
  
  rule get_all_temperatures{
    select when sensor temperatures
      foreach ent:sensors setting (s)
      pre{
        eci = s.klog("ECI")
        url = "http://localhost:8080/sky/cloud/" + eci + "/io.picolabs.temperature_store/temperatures"
      }
      fired{
        url_content = http:get(url){"content"}.decode().klog("URL_CONTENT");
        ent:temperatures := url_content;
       raise sensor event "get_temperatures"
      }else{
        
      }
  }

  rule get_temperature{
    select when sensor get_temperatures
      send_directive("Temperatures", {"temperatures": ent:temperatures})
  }
  
  
  rule clear_sensors  {
    select when sensor clear_sensors
      send_directive("clearing_sensors", {"result": "clearing sensors list"})
    fired{
       ent:sensors := {};
    }
  }
  rule clear_temperatures  {
    select when sensor clear_temperatures
      send_directive("clearing_temperatures", {"result": "clearing temperature list"})
    fired{
       ent:temperatures := {};
    }
  }
}
