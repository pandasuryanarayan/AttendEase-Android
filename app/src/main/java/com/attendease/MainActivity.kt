package com.attendease

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import com.attendease.ui.MainAppContent
import com.attendease.ui.theme.AttendEaseTheme
import com.attendease.ui.viewmodels.MainViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels {
        MainViewModel.Factory((application as AttendEaseApp).repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AttendEaseTheme {
                MainAppContent(viewModel = viewModel)
            }
        }
    }
}
