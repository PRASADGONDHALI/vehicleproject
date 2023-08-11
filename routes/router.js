const express = require("express");
const router = new express.Router();
const userdb = require("../models/userSchema");


router.post('/api/addscenario', async(req,res) =>{
    
    const { scenarioName, scenarioTime } = req.body;

    if (!scenarioName || !scenarioTime) {
        res.status(422).json({ error: "fill all the details" })
    }
    try {

        const preuser = await userdb.findOne({ scenarioName: scenarioName });

        if (preuser) {
            res.status(422).json({ error: "Scenario Name is already exist" })
        } else {
            const finalUser = new userdb({
                scenarioName,scenarioTime
            });


            const storeData = await finalUser.save();

            // console.log(storeData);
            res.status(201).json({ status: 201, storeData })
        }

    } catch (error) {
        res.status(422).json(error);
        console.log("catch block error");
    }
})

router.get('/api/scenarios', async (req, res) => {
    try {
      const scenarios = await userdb.find();
      res.json(scenarios);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/api/addVehicle', async (req, res) => {
    const { scenarioName, vehicles } = req.body;
  
    try {
      // Find the scenario in the database
      let existingScenario = await userdb.findOne({ scenarioName });
  
      if (!existingScenario) {
        return res.status(404).json({ error: 'Scenario not found.' });
      }
  
      // Validate vehicle data before adding it to the scenario
      const validationErrors = [];
      vehicles.forEach((vehicle) => {
        const { vehicleName, speed, positionX, positionY, direction } = vehicle;
        const errors = {};
  
        if (!vehicleName) {
          errors.vehicleName = 'Vehicle Name is required.';
        }
  
        if (isNaN(Number(speed)) || Number(speed) < 0 ) {
          errors.speed = 'Speed must be a number greater than 0';
        }
  
        if (isNaN(Number(positionX)) || Number(positionX) < 0 || Number(positionX) > 800) {
          errors.positionX = 'Position X must be a number between 0 and 800.';
        }
  
        if (isNaN(Number(positionY)) || Number(positionY) < 0 || Number(positionY) > 800) {
          errors.positionY = 'Position Y must be a number between 0 and 800.';
        }
  
        if (!direction) {
          errors.direction = 'Please select a direction.';
        }
  
        if (Object.keys(errors).length > 0) {
          validationErrors.push({ vehicleName, errors });
        }
      });
  
      if (validationErrors.length > 0) {
        return res.status(400).json({ validationErrors });
      }
  
      // Add the validated vehicle data to the scenario
      existingScenario.vehicles.push(...vehicles);
  
      // Save the scenario
      const updatedScenario = await existingScenario.save();
  
      res.status(200).json(updatedScenario);
    } catch (error) {
      console.error('Error adding vehicle data to the scenario:', error);
      res.status(500).json({ error: 'Failed to add vehicle data to the scenario.' });
    }
  });
  
  router.get('/api/items', async (req, res) => {
    try {
      const scenarios = await userdb.find();
      res.json(scenarios);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
    
  });

  router.put('/api/items/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { scenarioName, scenarioTime, vehicles } = req.body;
  
      const updatedScenario = await userdb.findByIdAndUpdate(
        id,
        { scenarioName, scenarioTime, vehicles },
        { new: true }
      );
  
      if (!updatedScenario) {
        return res.status(404).json({ error: 'Scenario not found' });
      }
  
      res.json(updatedScenario);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // API endpoint for deleting a scenario
  router.delete('/api/items/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedScenario = await userdb.findByIdAndDelete(id);
  
      if (!deletedScenario) {
        return res.status(404).json({ error: 'Scenario not found' });
      }
  
      res.json(deletedScenario);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }); 


  router.delete("/api/items", async (req, res) => {
    try {
      // Delete all scenarios from the database
      await userdb.deleteMany();
  
      // Respond with a success message
      res.json({ message: "All scenarios deleted successfully." });
    } catch (error) {
      // If there's an error, send an error response
      res.status(500).json({ error: "Error deleting scenarios." });
    }
  });
  

// Home
router.put("/api/items/:itemId/vehicles/:vehicleId", async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const vehicleId = req.params.vehicleId;
    const updatedVehicleData = req.body;

    const updatedItem = await userdb.findByIdAndUpdate(
      itemId,
      { $set: { "vehicles.$[vehicle]": updatedVehicleData } },
      { arrayFilters: [{ "vehicle._id": vehicleId }], new: true }
    );

    res.json(updatedItem.vehicles.find((vehicle) => vehicle._id == vehicleId));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update vehicle data" });
  }
});

// API endpoint for deleting a vehicle
router.delete("/api/items/:itemId/vehicles/:vehicleId", async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const vehicleId = req.params.vehicleId;

    const updatedItem = await userdb.findByIdAndUpdate(
      itemId,
      { $pull: { vehicles: { _id: vehicleId } } },
      { new: true }
    );

    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete vehicle data" });
  }
});


// Simulation
router.put('/api/updating', async (req, res) => {
  const updatedVehicles = req.body;

  try {

    for (const updatedVehicle of updatedVehicles) {
      await userdb.updateOne(
        { 'vehicles._id': updatedVehicle._id }, 
        {
          $set: {
            'vehicles.$.positionX': updatedVehicle.x,
            'vehicles.$.positionY': updatedVehicle.y,
            'vehicles.$.speed': updatedVehicle.speed ,
            'vehicles.$.direction': updatedVehicle.direction,
          },
        }
      );
    }

    res.status(200).json({ message: 'Vehicle positions updated successfully.' });
  } catch (error) {
    console.error('Error updating vehicle positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;