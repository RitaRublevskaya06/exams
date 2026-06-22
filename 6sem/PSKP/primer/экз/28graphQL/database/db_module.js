const mssql = require('mssql');


let config = {
      user: 'USER_LAB14', password: '1111', server: 'VIVO', database: 'Lab14PSKP',
    pool: { max: 10, min: 0, },
    options: { trustServerCertificate: true }
};

function DB(callBack) {

    this.getFaculties = (args, context) => {
        return (new mssql.Request())
            .query('select * from faculty')
            .then(record => { console.log(record.recordset); return record.recordset });
    };

    this.getPulpits = (args, context) => {
        return (new mssql.Request())
            .query('select * from pulpit')
            .then(record => { return record.recordset; });
    };

    this.getSubjects = (args, context) => {
        return (new mssql.Request())
            .query('select * from subject')
            .then(record => { return record.recordset; });
    };

    this.getTeachers = (args, context) => {
        return (new mssql.Request())
            .query('select * from teacher')
            .then(record => { return record.recordset; });
    };

    this.getFaculty = (args, context) => {
        return (new mssql.Request())
            .input('faculty', mssql.NVarChar, args.FACULTY)
            .query('select top(1) * from faculty where faculty = @faculty')
            .then(record => { console.log(record.recordset); return record.recordset; });
    };

    this.getPulpit = (args, context) => {
        return (new mssql.Request())
            .input('pulpit', mssql.NVarChar, args.PULPIT)
            .query('select top(1) * from pulpit where pulpit = @pulpit')
            .then(record => { return record.recordset; });
    };

    this.getSubject = (args, context) => {
        return (new mssql.Request())
            .input('subject', mssql.NVarChar, args.SUBJECT)
            .query('select top(1) * from subject where subject = @subject')
            .then(record => { return record.recordset; });
    };

    this.getTeacher = (args, context) => {
        return (new mssql.Request())
            .input('teacher', mssql.NVarChar, args.TEACHER)
            .query('select top(1) * from teacher where teacher = @teacher')
            .then(record => { return record.recordset; });
    };


    this.getTeachersByFaculty = (args, context) => {
    console.log(args);
    return (new mssql.Request())
        .input('faculty', mssql.NVarChar, args.FACULTY)
        .query(`
            SELECT 
                teacher.teacher,
                teacher.teacher_name,
                teacher.pulpit,
                pulpit.faculty
            FROM teacher 
            JOIN pulpit ON teacher.pulpit = pulpit.pulpit 
            JOIN faculty ON pulpit.faculty = faculty.faculty 
            WHERE faculty.faculty = @faculty
            ORDER BY teacher.pulpit, teacher.teacher
        `)
        .then(record => {
            if (record.recordset.length === 0) {
                return [{
                    FACULTY: args.FACULTY,
                    TEACHERS: []
                }];
            }

            const result = [];
            let currentGroup = null;

            record.recordset.forEach(row => {
                const teacher = {
                    TEACHER: row.teacher,
                    TEACHER_NAME: row.teacher_name,
                    PULPIT: row.pulpit
                };

                if (!currentGroup || currentGroup.FACULTY !== row.faculty) {
                    currentGroup = {
                        FACULTY: row.faculty || args.FACULTY,
                        TEACHERS: [teacher]
                    };
                    result.push(currentGroup);
                } else {
                    currentGroup.TEACHERS.push(teacher);
                }
            });

            console.log('Result:', result);
            return result;
        })
        .catch(err => {
            console.error('Database error:', err);
            throw new Error(`Database query failed: ${err.message}`);
        });
};



  this.getSubjectsByFaculties = (args, context) => {
    console.log(args);
    return (new mssql.Request())
        .input('faculty', mssql.NVarChar, args.FACULTY)
        .query(`
            SELECT 
                subject.subject AS subject,
                subject.subject_name AS subject_name,
                subject.pulpit AS pulpit,
                pulpit.pulpit_name AS pulpit_name,
                pulpit.faculty AS faculty
            FROM subject 
            JOIN pulpit ON subject.pulpit = pulpit.pulpit 
            JOIN faculty ON pulpit.faculty = faculty.faculty 
            WHERE faculty.faculty = @faculty
            ORDER BY subject.pulpit, subject.subject
        `)
        .then(record => {
            if (record.recordset.length === 0) {
                return [{
                    PULPIT: '',
                    PULPIT_NAME: 'No data',
                    FACULTY: args.FACULTY,
                    SUBJECTS: []
                }];
            }

            const result = [];
            let currentGroup = null;

            record.recordset.forEach(row => {
                const subject = {
                    SUBJECT: row.subject,
                    SUBJECT_NAME: row.subject_name
                };

                if (!currentGroup || currentGroup.PULPIT !== row.pulpit) {
                    currentGroup = {
                        PULPIT: row.pulpit,
                        PULPIT_NAME: row.PULPIT_NAME || row.pulpit_name || 'Unknown', 
                        FACULTY: row.FACULTY || row.faculty || args.FACULTY,           
                        SUBJECTS: [subject]
                    };
                    result.push(currentGroup);
                } else {
                    currentGroup.SUBJECTS.push(subject);
                }
            });

            console.log('Result:', result);
            return result;
        })
        .catch(err => {
            console.error('Database error:', err);
            throw new Error(`Database query failed: ${err.message}`);
        });
};



    this.insertFaculty = (args, context) => {
        return (new mssql.Request())
            .input('faculty', mssql.NVarChar, args.FACULTY)
            .input('faculty_name', mssql.NVarChar, args.FACULTY_NAME)
            .query('insert faculty(faculty, faculty_name) values (@faculty, @faculty_name)')
            .then(record => { return args });
    };

    this.insertPulpit = (args, context) => {
        return (new mssql.Request())
            .input('pulpit', mssql.NVarChar, args.PULPIT)
            .input('pulpit_name', mssql.NVarChar, args.PULPIT_NAME)
            .input('faculty', mssql.NVarChar, args.FACULTY)
            .query('insert pulpit(pulpit, pulpit_name, faculty) values (@pulpit, @pulpit_name, @faculty)')
            .then(record => { return args });
    };

    this.insertSubject = (args, context) => {
        return (new mssql.Request())
            .input('subject', mssql.NVarChar, args.SUBJECT)
            .input('subject_name', mssql.NVarChar, args.SUBJECT_NAME)
            .input('pulpit', mssql.NVarChar, args.PULPIT)
            .query('insert subject(subject, subject_name, pulpit) values (@subject, @subject_name, @pulpit)')
            .then(record => { return args });
    };

    this.insertTeacher = (args, context) => {
        return (new mssql.Request())
            .input('teacher', mssql.NVarChar, args.TEACHER)
            .input('teacher_name', mssql.NVarChar, args.TEACHER_NAME)
            .input('pulpit', mssql.NVarChar, args.PULPIT)
            .query('insert teacher(teacher, teacher_name, pulpit) values (@teacher, @teacher_name, @pulpit)')
            .then(record => { return args });
    };



    this.updateFaculty = (args, context) => {
        return (new mssql.Request())
            .input('faculty', mssql.NVarChar, args.FACULTY)
            .input('faculty_name', mssql.NVarChar, args.FACULTY_NAME)
            .query('update faculty set faculty = @faculty, faculty_name = @faculty_name where faculty = @faculty')
            .then(record => { return (record.rowsAffected[0] === 0) ? null : args; });
    };

    this.updatePulpit = (args, context) => {
        return (new mssql.Request())
            .input('pulpit', mssql.NVarChar, args.PULPIT)
            .input('pulpit_name', mssql.NVarChar, args.PULPIT_NAME)
            .input('faculty', mssql.NVarChar, args.FACULTY)
            .query('update pulpit set pulpit = @pulpit, pulpit_name = @pulpit_name, faculty = @faculty where pulpit = @pulpit')
            .then(record => { return (record.rowsAffected[0] === 0) ? null : args; });
    };

    this.updateSubject = (args, context) => {
        return (new mssql.Request())
            .input('subject', mssql.NVarChar, args.SUBJECT)
            .input('subject_name', mssql.NVarChar, args.SUBJECT_NAME)
            .input('pulpit', mssql.NVarChar, args.PULPIT)
            .query('update subject set subject = @subject, subject_name = @subject_name, pulpit = @pulpit where subject = @subject')
            .then(record => { return (record.rowsAffected[0] === 0) ? null : args; });
    };

    this.updateTeacher = (args, context) => {
        return (new mssql.Request())
            .input('teacher', mssql.NVarChar, args.TEACHER)
            .input('teacher_name', mssql.NVarChar, args.TEACHER_NAME)
            .input('pulpit', mssql.NVarChar, args.PULPIT)
            .query('update teacher set teacher = @teacher, teacher_name = @teacher_name, pulpit = @pulpit where teacher = @teacher')
            .then(record => { return (record.rowsAffected[0] === 0) ? null : args; });
    };


    this.delFaculty = (args, context) => {
        return (new mssql.Request())
            .input('faculty', mssql.NVarChar, args.FACULTY)
            .query('delete from faculty where faculty = @faculty')
            .then(record => {
               return record.rowsAffected[0] === 0 ? null : {
                FACULTY: args.FACULTY,
                FACULTY_NAME: "DELETED"
            };
            });
    };

    this.delPulpit = (args, context) => {
        return (new mssql.Request())
            .input('pulpit', mssql.NVarChar, args.PULPIT)
            .query('delete from pulpit where pulpit = @pulpit')
            .then(record => {
              return record.rowsAffected[0] === 0 ? null : {
                PULPIT: args.PULPIT,
                PULPIT_NAME: "DELETED", 
                FACULTY: "DELETED"
            };
            });
    };

    this.delSubject = (args, context) => {

        return (new mssql.Request())
            .input('subject', mssql.NVarChar, args.SUBJECT)
            .query('delete from subject where subject = @subject')
            .then(record => {
                return record.rowsAffected[0] === 0 ? null : {
                SUBJECT: args.SUBJECT,
                SUBJECT_NAME: "DELETED", 
                PULPIT: "DELETED"
            };
            });
    };

    this.delTeacher = (args, context) => {
        return (new mssql.Request())
            .input('teacher', mssql.NVarChar, args.TEACHER)
            .query('delete from teacher where teacher = @teacher')
            .then(record => {
            return record.rowsAffected[0] === 0 ? null : {
                TEACHER: args.TEACHER,
                TEACHER_NAME: "DELETED", 
                PULPIT: "DELETED"
            };
        });
    };

    this.connect = mssql.connect(config, err => {
        err ? callBack(err, null) : callBack(null, this.connect);
    });
}

exports.DB = callBack => new DB(callBack);