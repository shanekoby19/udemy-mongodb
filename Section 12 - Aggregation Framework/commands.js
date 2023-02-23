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



db.friends.aggregate([
    {
        $unwind: "$hobbies"
    },
    {
        $group: { _id: { age: "$age"} , hobbies: { $addToSet: "$hobbies" }}
    }
])

db.friends.aggregate([
    {
        $project: { 
            _id: 0,
            numScores: { 
                $size: "$examScores" 
            }
        }
    }
])

db.friends.aggregate([
    {
        $project: {
            _id: 0,
            examScores: {
                $filter: {
                    input: "$examScores",
                    as: "examScore",
                    cond: {
                        $gt: ["$$examScore.score", 60]
                    }
                }
            }
        }
    }
])

db.friends.aggregate([
    {
        $unwind: "$examScores"
    },
    { 
        $project: {
            _id: 1,
            name: 1,
            age: 1,
            score: "$examScores.score"
        }
    },
    {
        $sort: {
            score: -1
        }
    },
    {
        $group: {
            _id: "$_id",
            name: {
                $first: "$name"
            },
            maxScore: {
                $max: "$score"
            }
        }
    },
    {
        $sort: {
            maxScore: -1
        }
    }
])


db.persons.aggregate([
    {
        $bucket: {
            groupBy: "$dob.age",
            boundaries: [18, 30, 42, 54, 66, 78],
            output: {
                numPersons: { $sum: 1 },
                averageAge: { $avg: "$dob.age" },
            }
        }
    }
])

db.persons.aggregate([
    {
        $match: {
            "gender": "male"
        }
    },
    {
        $project: {
            _id: 0,
            name: { $concat: ["$name.title", " ", "$name.first", " ", "$name.last"]},
            gender: 1,
            birthdate: { $toDate: "$dob.date" }
        }
    },
    {
        $sort: {
            birthdate: 1
        }
    },
    { 
        $skip: 10
    },
    {
        $limit: 10
    },
    {
        $out: "sortedAges"
    }
])