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
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import LottieView from "lottie-react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import DatabaseService from "../services/database_service";
import colors from "../../assets/colors/colors";
import icons, { IconPath } from "../../assets/icon/icon";

interface Post {
  post_date: string;
  update_date: string;
  icon_path: IconPath;
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
  post_date: Date;
  update_date: Date;
  dot?: DotType | DotType[];
}

interface CustomCalendarProps {
  reloadKey: number;
}

type MarkedDates = Record<string, MarkedDateInfo>;

const CustomCalendar: React.FC<CustomCalendarProps> = ({ reloadKey }) => {
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const today = useMemo(() => new Date(), []);
  const [isToday, setIsToday] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

  // Centralized error handling
  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Error while ${context}:`, error);
    Alert.alert("Error", `An error occurred while ${context}`);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadMarkedDates();
        await checkTodayEntry();
      } catch (error) {
        handleError(error, "initializing app");
      }
    };

    initializeApp();
  }, [reloadKey]);

  // Custom day component with improved rendering and interaction
  const DayComponent: React.FC<DayComponentProps> = React.memo(
    ({ date, marking }) => {
      const currentDate = new Date(date.timestamp);

      // Memoized styling based on date properties
      const dayStyles = useMemo(() => {
        const isWeekend =
          currentDate.getDay() === 0 || currentDate.getDay() === 6;
        const isFutureDate = isAfter(currentDate, today);

        return {
          textColor: isWeekend
            ? currentDate.getDay() === 6
              ? colors.saturday
              : colors.sunday
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
                    opacity: dayStyles.opacity,
                  },
                ]}
              >
                {date.day}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }
  );

  // Load marked dates from database
  const loadMarkedDates = useCallback(async () => {
    try {
      const posts: Post[] = await DatabaseService.getPosts();
      const newMarkedDates: MarkedDates = {};

      posts.forEach((post) => {
        if (post) {
          try {
            const formattedDate = format(
              parseISO(post.post_date),
              "yyyy-MM-dd"
            );
            newMarkedDates[formattedDate] = {
              marked: true,
              post_date: new Date(post.post_date),
              update_date: new Date(post.update_date),
              dot: {
                lottieFile: icons[post.icon_path],
              },
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
  const handleDayPress = useCallback(
    (postDate: Date) => {
      // Prevent future date selection
      if (isAfter(postDate, today)) {
        Alert.alert("Error", "Please select a date before today");
        return;
      }

      const formattedDate = postDate.toISOString();

      DatabaseService.hasPostsOnDate(postDate)
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
    },
    [today, handleError]
  );

  // Check if today's entry exists
  const checkTodayEntry = useCallback(async () => {
    try {
      const exists = await DatabaseService.hasPostsOnDate(today);
      setIsToday(!exists);
    } catch (error) {
      handleError(error, "checking today's entry");
    }
  }, [today, handleError]);

  // Calendar theme with consistent styling
  const calendarTheme: Theme = useMemo(
    () => ({
      textMonthFontFamily: "kalam",
      textDayHeaderFontFamily: "kalam",
      calendarBackground: colors.backgroundLight,
      textSectionTitleColor: colors.textInLight,
      textDayHeaderFontSize: 14,
      textDayFontSize: 14,
      textMonthFontSize: 32,
      dayTextColor: colors.textInLight,
    }),
    []
  );

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadMarkedDates();
      await checkTodayEntry();
    } catch (error) {
      handleError(error, "refreshing data");
    } finally {
      setRefreshing(false);
    }
  }, [loadMarkedDates, checkTodayEntry, handleError]);

  // Navigation to settings
  const handleSettingPress = useCallback(() => {
    router.push("SettingScreen");
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.textInLight]}
          tintColor={colors.textInLight}
        />
      }
    >
      <View>
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
            initialDate={today.toISOString().slice(0, 10)}
            onDayPress={(day: DateData) =>
              handleDayPress(new Date(day.timestamp))
            }
            firstDay={0}
            hideExtraDays={true}
            markedDates={markedDates}
            dayComponent={(props: DayComponentProps) => (
              <DayComponent {...props} />
            )}
          />
        </View>

        {/* Submit Button for Today's Entry */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, { opacity: isToday ? 1 : 0.2 }]}
            onPress={() => handleDayPress(today)}
            disabled={!isToday}
          >
            <AntDesign name="plus" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAF7F0",
    flex: 1,
  },
  header: {
    padding: 16,
    justifyContent: "center",
    alignItems: "flex-end",
    marginRight: 10,
  },
  calendar: {
    padding: 10,
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
    marginBottom: 20,
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

export default React.memo(CustomCalendar);
