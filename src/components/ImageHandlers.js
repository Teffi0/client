// ImageHandlers.js
import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert, Modal, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import styles from '../styles/styles';

export const handleChoosePhoto = async (selectedImages, setSelectedImages) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
        Alert.alert('Уведомление', 'Необходим доступ к фотографиям для загрузки в отчет');
        return;
    }

    try {
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!pickerResult.canceled) {
            console.log(selectedImages);
            setSelectedImages(prevImages => [...prevImages, ...(pickerResult.assets || [])]);
        }
    } catch (error) {
        Alert.alert('Ошибка', 'Произошла ошибка при выборе фотографий');
    }
};

export const uploadImages = async (selectedImages, setSelectedImages, task) => {
    if (selectedImages.length === 0) {
        Alert.alert('Уведомление', 'Пожалуйста, выберите фотографии для загрузки');
        return;
    }

    const formData = new FormData();
    selectedImages.forEach((image, index) => {
        formData.append('photos', {
            name: `photo_${index}.jpg`,
            type: 'image/jpeg',
            uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
        });
    });

    try {
        const taskId = task.id;
        const response = await fetch(`http://31.129.101.174/tasks/${taskId}/photos`, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (!response.ok) throw new Error('Сетевая ошибка при загрузке изображений');
        setSelectedImages([]);
    } catch (error) {
        Alert.alert('Ошибка', 'Произошла ошибка при загрузке фотографий');
    }
};

export const handleRemoveImage = (index, setSelectedImages) => {
    setSelectedImages(currentImages => currentImages.filter((_, i) => i !== index));
};

export const openFullScreenImage = (index, setCurrentImageIndex, setFullScreenImageModalVisible) => {
    setCurrentImageIndex(index);
    setFullScreenImageModalVisible(true);
};

export const showNextImage = (currentImageIndex, setSelectedImages, selectedImages) => {
    if (currentImageIndex < selectedImages.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
    }
};

export const showPreviousImage = (currentImageIndex, setCurrentImageIndex) => {
    if (currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
    }
};

export const FullScreenImageModal = ({ isVisible, onClose, selectedImages, currentImageIndex, showNextImage, showPreviousImage }) => {
    const imageUri = selectedImages[currentImageIndex]?.uri;

    return (
        <Modal
            visible={isVisible}
            transparent={false}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                {imageUri && (
                    <Image
                        source={{ uri: imageUri }}
                        style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                    />
                )}
                <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20 }} onPress={onClose}>
                    <Text style={{ color: 'white', fontSize: 30 }}>×</Text>
                </TouchableOpacity>
                <ImageNavigationButtons
                    currentImageIndex={currentImageIndex}
                    selectedImages={selectedImages}
                    showNextImage={showNextImage}
                    showPreviousImage={showPreviousImage}
                />
            </View>
        </Modal>
    );
};

export const ImagePreview = ({ images, onRemovePress, onOpenPress }) => (
    <ScrollView horizontal style={styles.imagePreviewContainer} showsHorizontalScrollIndicator={false}>
        {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
                <TouchableOpacity onPress={() => onOpenPress(index)} style={styles.imagePreview}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                    <TouchableOpacity style={styles.removeIconContainer} onPress={() => onRemovePress(index)}>
                        <Text style={styles.removeIcon}>×</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </View>
        ))}
        <TouchableOpacity onPress={handleChoosePhoto} style={styles.image}>
            <View style={styles.photoPickerContainer}>
                <Text style={styles.photoPickerPlusIcon}>+</Text>
            </View>
        </TouchableOpacity>
    </ScrollView>
);

export const ImageNavigationButtons = ({ currentImageIndex, selectedImages, showPreviousImage, showNextImage }) => (
    <>
      {currentImageIndex > 0 && (
        <TouchableOpacity
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: '50%', justifyContent: 'center' }}
          onPress={() => showPreviousImage(currentImageIndex)}
        >
          <Text style={{ color: 'white', fontSize: 42, textAlign: 'left', marginLeft: 20 }}>‹</Text>
        </TouchableOpacity>
      )}
  
      {currentImageIndex < selectedImages.length - 1 && (
        <TouchableOpacity
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, left: '50%', justifyContent: 'center' }}
          onPress={() => showNextImage(currentImageIndex)}
        >
          <Text style={{ color: 'white', fontSize: 42, textAlign: 'right', marginRight: 20 }}>›</Text>
        </TouchableOpacity>
      )}
    </>
  );