import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Calendar, DateData } from "react-native-calendars";
import { Theme } from "react-native-calendars/src/types";
import { 
  Dimensions, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Pressable, 
  Alert 
} from "react-native";
import LottieView from "lottie-react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import DatabaseService from "../services/database_service";
import colors from "../../assets/colors/colors";
import icons, { IconPath } from "../../assets/icon/icon";

// Enhanced type definitions with improved type safety
interface Post {
  PostDate: string;
  UpdateDate: string;
  IconPath: IconPath;
}

interface DayComponentProps {
  date: DateData;
  marking?: MarkedDateInfo;
}

interface DotType {
  lottieFile: IconPath;
}

interface MarkedDateInfo {
  marked: boolean;
  postDate: Date;
  updateDate: Date;
  dot?: DotType | DotType[];
}

type MarkedDates = Record<string, MarkedDateInfo>;

const CustomCalendar: React.FC = () => {
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const today = useMemo(() => new Date(), []);
  const [isToday, setIsToday] = useState<boolean>(true);

  // Centralized error handling
  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error);
    Alert.alert("Error", `An error occurred while ${context}`);
  }, []);

  // Initialize app and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await DatabaseService.init();
        await DatabaseService.insertUser(); // Insert clone user data for testing
        await loadMarkedDates();
        await checkTodayEntry();
      } catch (error) {
        handleError(error, "initializing app");
      }
    };

    initializeApp();
  }, []);

  // Custom day component with improved rendering and interaction
  const DayComponent: React.FC<DayComponentProps> = React.memo(({ date, marking }) => {
    const currentDate = new Date(date.timestamp);
    
    // Memoized styling based on date properties
    const dayStyles = useMemo(() => {
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      const isFutureDate = isAfter(currentDate, today);

      return {
        textColor: isWeekend 
          ? (currentDate.getDay() === 6 ? colors.saturday : colors.sunday)
          : colors.textInLight,
        opacity: isFutureDate ? 0.3 : 1,
      };
    }, [currentDate, today]);

    // Render dots with memoization
    const renderDots = useCallback(() => {
      if (!marking?.dot) return null;

      const dots = Array.isArray(marking.dot) ? marking.dot : [marking.dot];

      return (
        <View style={styles.lottieContainer}>
          {dots.map((dot, index) => (
            <LottieView
              key={`${date.dateString}-${index}`}
              source={dot.lottieFile}
              autoPlay
              loop
              style={styles.lottieDot}
            />
          ))}
        </View>
      );
    }, [marking?.dot, date.dateString]);

    return (
      <TouchableOpacity
        style={styles.dayContainer}
        onPress={() => handleDayPress(currentDate)}
      >
        <View style={styles.dayContent}>
          {marking?.dot ? (
            renderDots()
          ) : (
            <Text 
              style={[
                styles.dayText, 
                { 
                  color: dayStyles.textColor, 
                  opacity: dayStyles.opacity 
                }
              ]}
            >
              {date.day}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  });

  // Load marked dates from database
  const loadMarkedDates = useCallback(async () => {
    try {
      const posts: Post[] = await DatabaseService.getPosts();
      const newMarkedDates: MarkedDates = {};

      posts.forEach(post => {
        if (post) {
          try {
            const formattedDate = format(parseISO(post.PostDate), "yyyy-MM-dd");
            newMarkedDates[formattedDate] = {
              marked: true,
              postDate: new Date(post.PostDate),
              updateDate: new Date(post.UpdateDate),
              dot: {
                lottieFile: icons[post.IconPath],
              }
            };
          } catch (error) {
            handleError(error, "parsing post date");
          }
        }
      });

      setMarkedDates(newMarkedDates);
    } catch (error) {
      handleError(error, "loading marked dates");
    }
  }, [handleError]);

  // Handle day press with comprehensive logic
  const handleDayPress = useCallback((postDate: Date) => {
    // Prevent future date selection
    if (isAfter(postDate, today)) {
      Alert.alert("Error", "Please select a date before today");
      return;
    }

    const formattedDate = postDate.toISOString();
    
    DatabaseService.existingDateOfPost(postDate)
      .then((exists) => {
        if (exists) {
          // Navigate to detail screen if post already exists
          router.push({
            pathname: "DetailScreen",
            params: { formattedDate },
          });
        } else {
          // Navigate to feeling selection for new entries
          router.push({
            pathname: "PickFeelingScreen",
            params: { formattedDate },
          });
        }
      })
      .catch((error) => handleError(error, "checking existing date"));
  }, [today, handleError]);

  // Check if today's entry exists
  const checkTodayEntry = useCallback(async () => {
    try {
      const exists = await DatabaseService.existingDateOfPost(today);
      setIsToday(!exists);
    } catch (error) {
      handleError(error, "checking today's entry");
    }
  }, [today, handleError]);

  // Calendar theme with consistent styling
  const calendarTheme: Theme = useMemo(() => ({
    textMonthFontFamily: "kalam",
    textDayHeaderFontFamily: "kalam",
    calendarBackground: colors.backgroundLight,
    textSectionTitleColor: colors.textInLight,
    textDayHeaderFontSize: 14,
    textDayFontSize: 14,
    textMonthFontSize: 32,
    dayTextColor: colors.textInLight,
  }), []);

  // Navigation to settings
  const handleSettingPress = useCallback(() => {
    router.push("SettingScreen");
  }, []);

  // Debug method to insert and print posts
  const printData = useCallback(async () => {
    try {
      await DatabaseService.insertPost();
      const posts = await DatabaseService.getPosts();
      console.log("Posts:", posts);
      
      // Optionally refresh marked dates after insertion
      await loadMarkedDates();
    } catch (error) {
      handleError(error, "printing data");
    }
  }, [handleError, loadMarkedDates]);

  return (
    <View style={styles.container}>
      {/* Header with settings icon */}
      <View style={styles.header}>
        <Pressable onPress={handleSettingPress}>
          <AntDesign name="setting" size={24} color="black" />
        </Pressable>
      </View>

      {/* Calendar Component */}
      <View style={styles.calendar}>
        <Calendar
          theme={calendarTheme}
          initialDate= {today.toISOString().slice(0, 10)}
          onDayPress={(day: DateData) => handleDayPress(new Date(day.timestamp))}
          firstDay={0}
          hideExtraDays={true}
          markedDates={markedDates}
          dayComponent={(props : DayComponentProps) => <DayComponent {...props} />}
        />
      </View>

      {/* Debug Button for Adding Posts */}
      <Pressable 
        style={styles.button} 
        onPress={printData}
      >
        <Text style={styles.buttonText}>Add + Print Data</Text>
      </Pressable>

      {/* Submit Button for Today's Entry */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton, 
            { opacity: isToday ? 1 : 0.2 }
          ]}
          onPress={() => handleDayPress(today)}
          disabled={!isToday}
        >
          <AntDesign name="plus" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(CustomCalendar);

// Styles remain mostly the same
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAF7F0"
  },
  header: {
    padding: 16,
    justifyContent: "center",
    alignItems: "flex-end",
    marginRight: 10
  },
  calendar: {
    padding: 10,
  },
  button: {
    backgroundColor: colors.backgroundDark,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontFamily: "kalam",
    fontSize: 16,
  },
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: width / 7,
    height: width / 7,
  },
  dayContent: {
    alignItems: "center",
  },
  dayText: {
    textAlign: "center",
    fontFamily: "kalam",
  },
  lottieContainer: {
    flexDirection: "row",
    marginTop: 2,
  },
  lottieDot: {
    width: 30,
    height: 30,
  },
  submitContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 100,
  },
  submitButton: {
    height: 50,
    width: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "black",
    borderWidth: 1,
  },
});