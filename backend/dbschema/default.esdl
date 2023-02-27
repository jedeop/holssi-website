module default {
  scalar type ProjectStatus extending enum<Created, Building, Finished>;

  type Project {
    required property status -> ProjectStatus {
      default := ProjectStatus.Created;
    };
    link entry_file -> File;
    link executable -> File;
    required property created -> datetime {
      default := datetime_current();
      readonly := true;
    };
  }

  type File {
    required property name -> str;
    required property created -> datetime {
      default := datetime_current();
      readonly := true;
    };
  }

  type RateLimit {
    required property ip -> str;
    required property count -> int32;
    required property reset_datetime -> datetime;
  }
}