import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';
import { getInitials } from '../../utils/formatters';

interface AvatarPickerProps {
    photoURL?: string;
    firstName?: string;
    lastName?: string;
    size?: number;
    editable?: boolean;
    onPhotoSelected?: (uri: string) => void;
}

export default function AvatarPicker({
    photoURL,
    firstName = '',
    lastName = '',
    size = 120,
    editable = true,
    onPhotoSelected,
}: AvatarPickerProps) {
    const handlePickImage = async () => {
        if (!editable) return;

        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permission requise',
                'Nous avons besoin d\'accéder à votre galerie pour changer votre photo.'
            );
            return;
        }

        // Pick image
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            onPhotoSelected?.(result.assets[0].uri);
        }
    };

    const initials = getInitials(firstName || '?', lastName || '?');

    return (
        <TouchableOpacity
            onPress={handlePickImage}
            disabled={!editable}
            style={[styles.container, { width: size, height: size }]}
        >
            {photoURL ? (
                <Image
                    source={{ uri: photoURL }}
                    style={[
                        styles.image,
                        { width: size, height: size, borderRadius: size / 2 },
                    ]}
                />
            ) : (
                <View
                    style={[
                        styles.placeholder,
                        { width: size, height: size, borderRadius: size / 2 },
                    ]}
                >
                    <Text style={[styles.initials, { fontSize: size / 3 }]}>
                        {initials}
                    </Text>
                </View>
            )}

            {editable && (
                <View style={styles.editBadge}>
                    <Ionicons name="camera-outline" size={18} color={Colors.background} />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    image: {
        backgroundColor: Colors.backgroundSecondary,
    },
    placeholder: {
        backgroundColor: Colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.border,
        borderStyle: 'dashed',
    },
    initials: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: Colors.background,
    },

});
