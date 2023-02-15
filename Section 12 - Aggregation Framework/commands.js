db.persons.aggregate([
    { 
        $project : { 
            _id: 0, 
            gender: 1, 
            fullName: { 
                $concat: [
                    { $toUpper: { $substrCP: ["$name.first", 0, 1] } },
                    { $substrCP: ["$name.first", 1, { $subtract: [{ $strLenCP:  "$name.first" }, 1]}] },
                    " ", 
                    { $toUpper: { $substrCP: ["$name.last", 0, 1] } },
                    { $substrCP: [ "$name.last", 1, { $subtract: [{ $strLenCP: "$name.last" }, 1]} ]}
                ]
            },
            geoJSON: {
                type: 'Point',
                coordinates: [
                    { 
                        $convert: {
                            input: "$location.coordinates.latitude", 
                            to: "double",
                            onError: 0.0,
                            onNull: 0.0,
                        }
                    },
                    {
                        $toDouble: "$location.coordinates.longitude"
                    }
                ]
            },
            email: 1,
            age: "$dob.age",
            birthday: {
                $dateToString: {
                    date: { 
                        $toDate: "$dob.date"
                    },
                    format: "%m-%d-%Y"
                }
                
            }
        }
    },
    {
        $group: {
            _id: { 
                "birthYear": { 
                    $substrCP: [
                        "$birthday", 
                        { 
                            $subtract: [{ $strLenCP: "$birthday"}, 4] 
                        },
                        4
                    ]
                }
            }
        }
    }
])